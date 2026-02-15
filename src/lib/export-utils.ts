import jsPDF from 'jspdf';
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
