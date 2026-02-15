import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

// Helper function to load image as ArrayBuffer for Word
async function loadImageAsArrayBuffer(url: string): Promise<Uint8Array | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
}

export async function exportToPDF(words: Word[], settings: ExportSettings): Promise<void> {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Add title and header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mots à retravailler', margin, yPosition);
  yPosition += 10;

  if (settings.includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('fr-FR'), margin, yPosition);
    yPosition += 8;
  }

  doc.text(`${words.length} mots`, margin, yPosition);
  yPosition += 12;

  // Grid layout handling
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const colWidth = (pageWidth - margin * 2 - (cols - 1) * 10) / cols;
    const cellHeight = 20;
    let currentCol = 0;
    let currentRow = 0;

    words.forEach((word, index) => {
      let x = margin + currentCol * (colWidth + 10);
      let y = yPosition + currentRow * cellHeight;

      // Check page break
      if (y > pageHeight - margin - cellHeight) {
        doc.addPage();
        yPosition = margin;
        currentRow = 0;
        currentCol = 0;
        // Recalculate positions with new page values
        x = margin + currentCol * (colWidth + 10);
        y = yPosition + currentRow * cellHeight;
      }

      // Draw cell border
      doc.rect(x, y, colWidth, cellHeight);

      // Word text
      doc.setFontSize(11);
      let text = settings.display !== 'imageOnly' ? word.MOTS : '';
      if (settings.includePhonemes && word.PHONEMES) {
        text += `\n/${word.PHONEMES}/`;
      }

      doc.text(text, x + 5, y + 10);

      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    });
  } else {
    // List layout with optional images
    doc.setFontSize(12);
    const lineHeight = 7;
    const imageSize = 20; // 20mm square images

    // Load all images if needed
    const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
    const imageDataMap = new Map<string, string>();

    if (hasImages) {
      for (const word of words) {
        if (word["image associée"]) {
          const imageData = await loadImageAsBase64(word["image associée"]);
          if (imageData) {
            imageDataMap.set(word.MOTS, imageData);
          }
        }
      }
    }

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const hasImage = hasImages && imageDataMap.has(word.MOTS);
      const itemHeight = hasImage ? imageSize + 5 : lineHeight;

      // Check page break
      if (yPosition + itemHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      let xOffset = margin + 5;

      // Number or bullet
      let prefix = settings.numberWords ? `${index + 1}. ` : '• ';
      doc.text(prefix, xOffset, yPosition + (hasImage ? imageSize / 2 : 0));
      xOffset += 10;

      // Image
      if (hasImage) {
        const imageData = imageDataMap.get(word.MOTS);
        if (imageData) {
          doc.addImage(imageData, 'JPEG', xOffset, yPosition, imageSize, imageSize);
          xOffset += imageSize + 5;
        }
      }

      // Text
      if (settings.display !== 'imageOnly') {
        let text = word.MOTS;
        if (settings.includePhonemes && word.PHONEMES) text += ` /${word.PHONEMES}/`;
        if (settings.includeCategories && word.SYNT) text += ` (${word.SYNT})`;
        doc.text(text, xOffset, yPosition + (hasImage ? imageSize / 2 : 0));
      }

      yPosition += itemHeight;
    }
  }

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text(
    'Généré depuis Ressources Orthophonie',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  const filename = `mots-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export async function exportToWord(words: Word[], settings: ExportSettings): Promise<void> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: 'Mots à retravailler',
      heading: 'Heading1',
      spacing: { after: 200 },
    })
  );

  // Date if enabled
  if (settings.includeDate) {
    children.push(
      new Paragraph({
        text: new Date().toLocaleDateString('fr-FR'),
        spacing: { after: 100 },
      })
    );
  }

  // Word count
  children.push(
    new Paragraph({
      text: `${words.length} mots`,
      spacing: { after: 300 },
    })
  );

  // Grid layout using tables
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const rows: TableRow[] = [];

    for (let i = 0; i < words.length; i += cols) {
      const cells: TableCell[] = [];

      for (let j = 0; j < cols; j++) {
        const word = words[i + j];
        if (word) {
          const textRuns: TextRun[] = [];
          if (settings.display !== 'imageOnly') {
            textRuns.push(new TextRun({ text: word.MOTS, bold: true }));
          }
          if (settings.includePhonemes && word.PHONEMES) {
            textRuns.push(new TextRun(`\n/${word.PHONEMES}/`));
          }

          cells.push(
            new TableCell({
              children: [new Paragraph({ children: textRuns })],
              width: { size: 100 / cols, type: WidthType.PERCENTAGE },
            })
          );
        } else {
          cells.push(
            new TableCell({
              children: [new Paragraph('')],
              width: { size: 100 / cols, type: WidthType.PERCENTAGE },
            })
          );
        }
      }

      rows.push(new TableRow({ children: cells }));
    }

    children.push(
      new Table({
        rows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    // List layout with optional images
    const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
    const imageDataMap = new Map<string, Uint8Array>();

    // Load all images if needed
    if (hasImages) {
      for (const word of words) {
        if (word["image associée"]) {
          const imageData = await loadImageAsArrayBuffer(word["image associée"]);
          if (imageData) {
            imageDataMap.set(word.MOTS, imageData);
          }
        }
      }
    }

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const paragraphChildren: (TextRun | ImageRun)[] = [];

      // Number or bullet
      if (settings.numberWords) {
        paragraphChildren.push(new TextRun(`${index + 1}. `));
      } else {
        paragraphChildren.push(new TextRun('• '));
      }

      // Image
      if (hasImages && imageDataMap.has(word.MOTS)) {
        const imageData = imageDataMap.get(word.MOTS);
        if (imageData) {
          paragraphChildren.push(
            new ImageRun({
              data: imageData,
              transformation: {
                width: 80,
                height: 80,
              },
            })
          );
          paragraphChildren.push(new TextRun(' ')); // Space after image
        }
      }

      // Word text
      if (settings.display !== 'imageOnly') {
        paragraphChildren.push(new TextRun({ text: word.MOTS, bold: true }));
      }

      // Phonemes if enabled
      if (settings.includePhonemes && word.PHONEMES) {
        paragraphChildren.push(new TextRun(` /${word.PHONEMES}/`));
      }

      // Category if enabled
      if (settings.includeCategories && word.SYNT) {
        paragraphChildren.push(new TextRun(` (${word.SYNT})`));
      }

      children.push(
        new Paragraph({
          children: paragraphChildren,
          spacing: { after: 150 },
        })
      );
    }
  }

  // Footer
  children.push(
    new Paragraph({
      text: 'Généré depuis Ressources Orthophonie',
      alignment: AlignmentType.CENTER,
      italics: true,
      spacing: { before: 400 },
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const filename = `mots-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, filename);
}

export function exportToPrint(words: Word[], settings: ExportSettings): void {
  // Create print content
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Mots à retravailler</title>
      <style>
        @page {
          margin: 2cm;
        }
        body {
          font-family: 'Arial', sans-serif;
          font-size: 12pt;
          line-height: 1.6;
        }
        h1 {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
        .date {
          font-size: 10pt;
          color: #666;
          margin-bottom: 0.3em;
        }
        .count {
          font-size: 10pt;
          margin-bottom: 1.5em;
        }
        .word-list {
          list-style: ${settings.numberWords ? 'decimal' : 'disc'};
          padding-left: 2em;
        }
        .word-list li {
          margin-bottom: 0.8em;
          display: flex;
          align-items: flex-start;
          gap: 0.5em;
        }
        .word-item {
          display: flex;
          flex-direction: column;
          gap: 0.3em;
        }
        .word-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        .phoneme {
          color: #666;
          font-size: 10pt;
        }
        .category {
          color: #666;
          font-size: 10pt;
        }
        .footer {
          margin-top: 2em;
          padding-top: 1em;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 9pt;
          color: #999;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <h1>Mots à retravailler</h1>
  `;

  if (settings.includeDate) {
    html += `<div class="date">${new Date().toLocaleDateString('fr-FR')}</div>`;
  }

  html += `<div class="count">${words.length} mots</div>`;
  html += `<ul class="word-list">`;

  words.forEach((word) => {
    html += `<li><div class="word-item">`;

    // Image
    if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
      html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image" />`;
    }

    // Text content
    let textContent = '';
    if (settings.display !== 'imageOnly') {
      textContent += `<strong>${word.MOTS}</strong>`;
    }

    if (settings.includePhonemes && word.PHONEMES) {
      textContent += ` <span class="phoneme">/${word.PHONEMES}/</span>`;
    }

    if (settings.includeCategories && word.SYNT) {
      textContent += ` <span class="category">(${word.SYNT})</span>`;
    }

    if (textContent) {
      html += `<div>${textContent}</div>`;
    }

    html += `</div></li>`;
  });

  html += `</ul>`;
  html += `<div class="footer">Généré depuis Ressources Orthophonie</div>`;
  html += `</body></html>`;

  // Use hidden iframe instead of popup (works with Firefox + uBlock)
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (iframeDoc) {
    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();

        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 250);
    };

    // Fallback if onload doesn't fire
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after printing
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 500);
  }
}
