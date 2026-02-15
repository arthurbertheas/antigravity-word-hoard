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
  // DEBUG: Log settings to console
  console.log('[exportToPrint] Settings received:', settings);
  console.log('[exportToPrint] Layout value:', settings.layout);
  console.log('[exportToPrint] Layout type:', typeof settings.layout);

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

        /* Footer */
        .document-footer {
          margin-top: 40px;
          padding-top: 32px;
          border-top: 1px solid var(--color-border);
          text-align: center;
        }

        .footer-brand {
          font-family: var(--font-serif);
          font-size: 13px;
          color: var(--color-text-muted);
          font-style: italic;
          margin-bottom: 6px;
        }

        .footer-tagline {
          font-size: 11px;
          color: #CBD5E0;
          letter-spacing: 0.5px;
        }

        @media print {
          .document-footer {
            page-break-inside: avoid;
          }
        }

        /* List 1 Column Layout */
        .word-list-1col {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .word-item-list {
          background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          gap: 14px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .word-item-list::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        }

        .word-number {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, #8B7FE8 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 15px;
          box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);
        }

        .word-bullet {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          color: var(--color-primary);
          font-weight: 600;
        }

        .word-content-list {
          flex: 1;
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .word-image-list {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--color-border);
          background: white;
        }

        .word-details {
          flex: 1;
        }

        .word-text {
          font-family: var(--font-serif);
          font-size: 22px;
          font-weight: 600;
          color: var(--color-text-primary);
          margin-bottom: 6px;
          line-height: 1.3;
        }

        .word-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }

        .word-phoneme {
          font-size: 14px;
          color: var(--color-primary);
          font-style: italic;
        }

        .word-category {
          display: inline-block;
          font-size: 11px;
          color: var(--color-text-secondary);
          background: #EDF2F7;
          padding: 4px 12px;
          border-radius: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        @media print {
          .word-item-list {
            page-break-inside: avoid;
          }
        }

        /* Grid 2 Columns Layout */
        .word-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .word-card {
          background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          position: relative;
          overflow: hidden;
        }

        .word-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        }

        .word-card-content {
          flex: 1;
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .word-image-card {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--color-border);
          background: white;
        }

        @media print {
          .word-card {
            page-break-inside: avoid;
          }
        }

        /* Grid 3 Columns Layout */
        .word-grid-3col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        /* Smaller cards for 3 columns */
        .word-grid-3col .word-card {
          padding: 16px;
        }

        .word-grid-3col .word-number {
          width: 30px;
          height: 30px;
          font-size: 13px;
        }

        .word-grid-3col .word-bullet {
          width: 30px;
          height: 30px;
          font-size: 16px;
        }

        .word-grid-3col .word-image-card {
          width: 48px;
          height: 48px;
        }

        .word-grid-3col .word-text {
          font-size: 18px;
        }

        .word-grid-3col .word-phoneme {
          font-size: 12px;
        }

        .word-grid-3col .word-category {
          font-size: 10px;
          padding: 3px 8px;
        }

        /* Flashcards Layout */
        .word-flashcards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }

        .flashcard {
          background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }

        .flashcard::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
        }

        .flashcard-number {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, #8B7FE8 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(108, 92, 231, 0.25);
          z-index: 1;
        }

        .flashcard-image {
          width: 100%;
          height: 120px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--color-border);
          background: white;
        }

        .flashcard-text {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
          text-align: center;
        }

        .flashcard-meta {
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: center;
          text-align: center;
        }

        .flashcard-phoneme {
          font-size: 12px;
          color: var(--color-primary);
          font-style: italic;
        }

        .flashcard-category {
          font-size: 10px;
          color: var(--color-text-secondary);
          background: #EDF2F7;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        @media print {
          .flashcard {
            page-break-inside: avoid;
          }
        }

        /* Table Layout */
        .word-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }

        .word-table thead {
          background: linear-gradient(135deg, var(--color-bg-card) 0%, #FFFFFF 100%);
          border-bottom: 2px solid var(--color-primary);
        }

        .word-table th {
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--color-text-primary);
          text-align: left;
          padding: 12px 16px;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .word-table tbody tr {
          border-bottom: 1px solid var(--color-border);
        }

        .word-table tbody tr:hover {
          background: var(--color-bg-card);
        }

        .word-table td {
          padding: 12px 16px;
          vertical-align: middle;
        }

        .table-number {
          width: 50px;
          text-align: center;
          font-weight: 600;
          color: var(--color-primary);
        }

        .table-image {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--color-border);
        }

        .table-word {
          font-family: var(--font-serif);
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .table-phoneme {
          color: var(--color-primary);
          font-style: italic;
          font-size: 13px;
        }

        .table-category {
          font-size: 11px;
          color: var(--color-text-secondary);
          background: #EDF2F7;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: inline-block;
        }

        @media print {
          .word-table {
            page-break-inside: avoid;
          }

          .word-table tbody tr {
            page-break-inside: avoid;
          }
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

  // Generate content based on layout
  if (settings.layout === 'list-1col') {
    html += `<div class="word-list-1col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-item-list">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-content-list">
      `;

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-list" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
  else if (settings.layout === 'grid-2col') {
    html += `<div class="word-grid-2col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-card">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-card-content">
      `;

      // Image (if applicable)
      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-card" />`;
      }

      // Text content
      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
  else if (settings.layout === 'grid-3col') {
    html += `<div class="word-grid-3col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-card">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-card-content">
      `;

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-card" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
  else if (settings.layout === 'flashcards') {
    html += `<div class="word-flashcards">`;

    words.forEach((word, index) => {
      html += `<div class="flashcard">`;

      if (settings.numberWords) {
        html += `<div class="flashcard-number">${index + 1}</div>`;
      }

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="flashcard-image" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="flashcard-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="flashcard-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="flashcard-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="flashcard-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }
      }

      html += `</div>`;
    });

    html += `</div>`;
  }
  else if (settings.layout === 'table') {
    html += `<table class="word-table">`;
    html += `<thead><tr>`;

    if (settings.numberWords) {
      html += `<th>#</th>`;
    }

    if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
      html += `<th>Image</th>`;
    }

    if (settings.display !== 'imageOnly') {
      html += `<th>Mot</th>`;
    }

    if (settings.includePhonemes) {
      html += `<th>Phonème</th>`;
    }

    if (settings.includeCategories) {
      html += `<th>Catégorie</th>`;
    }

    html += `</tr></thead>`;
    html += `<tbody>`;

    words.forEach((word, index) => {
      html += `<tr>`;

      if (settings.numberWords) {
        html += `<td class="table-number">${index + 1}</td>`;
      }

      if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
        html += `<td>`;
        if (word["image associée"]) {
          html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="table-image" />`;
        }
        html += `</td>`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<td class="table-word">${word.MOTS}</td>`;
      }

      if (settings.includePhonemes) {
        html += `<td class="table-phoneme">${word.PHONEMES || ''}</td>`;
      }

      if (settings.includeCategories) {
        html += `<td><span class="table-category">${word.SYNT || ''}</span></td>`;
      }

      html += `</tr>`;
    });

    html += `</tbody></table>`;
  }
  else {
    // Fallback: use list-1col for unknown layouts
    console.warn(`Unknown layout: ${settings.layout}, falling back to list-1col`);

    html += `<div class="word-list-1col">`;

    words.forEach((word, index) => {
      html += `
        <div class="word-item-list">
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : `<div class="word-bullet">•</div>`
          }
          <div class="word-content-list">
      `;

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-list" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          html += `</div>`;
        }

        html += `</div>`;
      }

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
  html += `
    <footer class="document-footer">
      <div class="footer-brand">Généré depuis Ressources Orthophonie</div>
      <div class="footer-tagline">Document créé avec soin pour la rééducation</div>
    </footer>
  `;
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
