import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

export function exportToPDF(words: Word[], settings: ExportSettings): void {
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
    // List layout (original implementation)
    doc.setFontSize(12);
    const lineHeight = 7;

    words.forEach((word, index) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      let text = settings.numberWords ? `${index + 1}. ` : '• ';
      if (settings.display !== 'imageOnly') text += word.MOTS;
      if (settings.includePhonemes && word.PHONEMES) text += ` /${word.PHONEMES}/`;
      if (settings.includeCategories && word.SYNT) text += ` (${word.SYNT})`;

      doc.text(text, margin + 5, yPosition);
      yPosition += lineHeight;
    });
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
    // List layout (original implementation)
    words.forEach((word, index) => {
      const textRuns: TextRun[] = [];

      // Number or bullet
      if (settings.numberWords) {
        textRuns.push(new TextRun(`${index + 1}. `));
      } else {
        textRuns.push(new TextRun('• '));
      }

      // Word
      if (settings.display !== 'imageOnly') {
        textRuns.push(new TextRun({ text: word.MOTS, bold: true }));
      }

      // Phonemes if enabled
      if (settings.includePhonemes && word.PHONEMES) {
        textRuns.push(new TextRun(` /${word.PHONEMES}/`));
      }

      // Category if enabled
      if (settings.includeCategories && word.SYNT) {
        textRuns.push(new TextRun(` (${word.SYNT})`));
      }

      children.push(
        new Paragraph({
          children: textRuns,
          spacing: { after: 100 },
        })
      );
    });
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
          margin-bottom: 0.5em;
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
    let itemContent = '';

    if (settings.display !== 'imageOnly') {
      itemContent += `<strong>${word.MOTS}</strong>`;
    }

    if (settings.includePhonemes && word.PHONEMES) {
      itemContent += ` <span class="phoneme">/${word.PHONEMES}/</span>`;
    }

    if (settings.includeCategories && word.SYNT) {
      itemContent += ` <span class="category">(${word.SYNT})</span>`;
    }

    html += `<li>${itemContent}</li>`;
  });

  html += `</ul>`;
  html += `<div class="footer">Généré depuis Ressources Orthophonie</div>`;
  html += `</body></html>`;

  // Open print window with security features
  const printWindow = window.open('', '_blank', 'noopener,noreferrer');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for document to be fully loaded before printing
    const waitForLoad = () => {
      if (printWindow.document.readyState === 'complete') {
        // Focus the window to ensure print dialog appears
        printWindow.focus();

        // Small delay to ensure focus is set
        setTimeout(() => {
          printWindow.print();

          // Close window after printing (user can cancel)
          printWindow.onafterprint = () => {
            printWindow.close();
          };
        }, 250);
      } else {
        setTimeout(waitForLoad, 50);
      }
    };

    waitForLoad();
  }
}
