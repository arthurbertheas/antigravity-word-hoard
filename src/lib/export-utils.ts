import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

export function exportToPDF(words: Word[], settings: ExportSettings): void {
  const doc = new jsPDF();

  // Document settings
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const lineHeight = 7;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = () => {
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Mots à retravailler', margin, yPosition);
  yPosition += 10;

  // Date if enabled
  if (settings.includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('fr-FR');
    doc.text(dateStr, margin, yPosition);
    yPosition += 8;
  }

  // Word count
  doc.setFontSize(10);
  doc.text(`${words.length} mots`, margin, yPosition);
  yPosition += 12;

  // Words list
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  words.forEach((word, index) => {
    checkPageBreak();

    let text = '';

    // Number if enabled
    if (settings.numberWords) {
      text += `${index + 1}. `;
    } else {
      text += '• ';
    }

    // Word
    if (settings.display !== 'imageOnly') {
      text += word.MOTS;
    }

    // Phonemes if enabled
    if (settings.includePhonemes && word.PHONEMES) {
      text += ` /${word.PHONEMES}/`;
    }

    // Category if enabled
    if (settings.includeCategories && word.SYNT) {
      text += ` (${word.SYNT})`;
    }

    doc.text(text, margin + 5, yPosition);
    yPosition += lineHeight;
  });

  // Footer
  yPosition = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Généré depuis Ressources Orthophonie', pageWidth / 2, yPosition, {
    align: 'center',
  });

  // Download
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

  // Words
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

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
