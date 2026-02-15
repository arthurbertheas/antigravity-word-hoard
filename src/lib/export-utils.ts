import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

// Helper function to convert SVG to PNG
async function convertSvgToPng(svgDataUrl: string, width: number = 200, height: number = 200): Promise<string | null> {
  try {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to PNG
        const pngDataUrl = canvas.toDataURL('image/png');
        console.log('[SVG→PNG] Converted successfully, length:', pngDataUrl.length);
        resolve(pngDataUrl);
      };

      img.onerror = (error) => {
        console.error('[SVG→PNG] Failed to load image:', error);
        reject(error);
      };

      img.src = svgDataUrl;
    });
  } catch (error) {
    console.error('[SVG→PNG] Conversion error:', error);
    return null;
  }
}

// Helper function to load image as base64 (with SVG support for PDF)
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    console.log('[PDF] Loading image:', url);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      console.error('[PDF] Failed to fetch image:', response.status, response.statusText);
      return null;
    }
    const blob = await response.blob();
    console.log('[PDF] Image blob loaded:', blob.type, blob.size, 'bytes');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        console.log('[PDF] Image converted to base64, length:', result.length);

        // If SVG, convert to PNG
        if (blob.type === 'image/svg+xml') {
          console.log('[PDF] Detected SVG, converting to PNG...');
          const pngData = await convertSvgToPng(result, 200, 200);
          if (pngData) {
            resolve(pngData);
          } else {
            reject(new Error('Failed to convert SVG to PNG'));
          }
        } else {
          resolve(result);
        }
      };
      reader.onerror = (error) => {
        console.error('[PDF] FileReader error:', error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[PDF] Error loading image:', url, error);
    return null;
  }
}

// Helper function to load image as ArrayBuffer for Word (with SVG support)
async function loadImageAsArrayBuffer(url: string): Promise<Uint8Array | null> {
  try {
    console.log('[Word] Loading image:', url);
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      console.error('[Word] Failed to fetch image:', response.status, response.statusText);
      return null;
    }

    const blob = await response.blob();
    console.log('[Word] Image loaded:', blob.type, blob.size, 'bytes');

    // If SVG, convert to PNG first
    if (blob.type === 'image/svg+xml') {
      console.log('[Word] Detected SVG, converting to PNG...');

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const svgDataUrl = reader.result as string;
          const pngDataUrl = await convertSvgToPng(svgDataUrl, 200, 200);

          if (!pngDataUrl) {
            reject(new Error('Failed to convert SVG to PNG'));
            return;
          }

          // Convert PNG data URL to ArrayBuffer
          const pngResponse = await fetch(pngDataUrl);
          const pngArrayBuffer = await pngResponse.arrayBuffer();
          resolve(new Uint8Array(pngArrayBuffer));
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // Regular image (PNG, JPEG, etc.)
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  } catch (error) {
    console.error('[Word] Error loading image:', url, error);
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
      console.log('[PDF] Loading images for', words.length, 'words');
      let loadedCount = 0;
      for (const word of words) {
        if (word["image associée"]) {
          const imageData = await loadImageAsBase64(word["image associée"]);
          if (imageData) {
            imageDataMap.set(word.MOTS, imageData);
            loadedCount++;
          }
        }
      }
      console.log('[PDF] Successfully loaded', loadedCount, 'images out of', words.filter(w => w["image associée"]).length);
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
          doc.addImage(imageData, 'PNG', xOffset, yPosition, imageSize, imageSize);
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
      console.log('[Word] Loading images for', words.length, 'words');
      let loadedCount = 0;
      for (const word of words) {
        if (word["image associée"]) {
          const imageData = await loadImageAsArrayBuffer(word["image associée"]);
          if (imageData) {
            imageDataMap.set(word.MOTS, imageData);
            loadedCount++;
          }
        }
      }
      console.log('[Word] Successfully loaded', loadedCount, 'images out of', words.filter(w => w["image associée"]).length);
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
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mots à retravailler</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

      <style>
        /* CSS Variables */
        :root {
          --color-primary: #6C5CE7;
          --color-primary-light: #A29BFE;
          --color-primary-dark: #5B4CD6;
          --color-text-primary: #1A202C;
          --color-text-secondary: #718096;
          --color-text-muted: #A0AEC0;
          --color-border: #E2E8F0;
          --color-bg-card: #FAFBFC;
          --font-serif: 'Crimson Pro', Georgia, serif;
          --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Base styles */
        body {
          font-family: var(--font-sans);
          color: var(--color-text-primary);
          line-height: 1.6;
          padding: 48px 40px;
          background: white;
        }

        @page {
          size: A4;
          margin: 20mm;
        }

        @media print {
          body {
            padding: 0;
          }
        }

        /* Header Section */
        .document-header {
          border-bottom: 3px solid transparent;
          border-image: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
          border-image-slice: 1;
          padding-bottom: 24px;
          margin-bottom: 40px;
        }

        .header-title {
          font-family: var(--font-serif);
          font-size: 32px;
          font-weight: 700;
          color: var(--color-text-primary);
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }

        .header-subtitle {
          font-size: 15px;
          color: var(--color-primary);
          font-weight: 500;
          margin-bottom: 12px;
        }

        .header-meta {
          display: flex;
          gap: 24px;
          font-size: 13px;
          color: var(--color-text-secondary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .meta-icon {
          width: 16px;
          height: 16px;
          color: var(--color-primary);
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
  `;

  html += `
    <header class="document-header">
      <h1 class="header-title">Mots à retravailler</h1>
      <p class="header-subtitle">Liste d'exercices personnalisée</p>
      <div class="header-meta">
  `;

  if (settings.includeDate) {
    html += `
        <div class="meta-item">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <span>${new Date().toLocaleDateString('fr-FR')}</span>
        </div>
    `;
  }

  html += `
        <div class="meta-item">
          <svg class="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
          <span>${words.length} mots sélectionnés</span>
        </div>
      </div>
    </header>
  `;
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
