import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';
import { WordStatus } from '@/contexts/PlayerContext';
import { STATUS_COLORS, getWordExportStatus, ExportWordStatus } from '@/types/export';

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

export async function exportToPDF(words: Word[], settings: ExportSettings, wordStatuses?: Map<string, WordStatus>, currentIndex?: number): Promise<void> {
  const doc = new jsPDF();
  const isSessionMode = !!wordStatuses;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Clinical Elegance colors
  const primaryColor = [108, 92, 231]; // #6C5CE7
  const lightGray = [250, 251, 252]; // #FAFBFC
  const borderGray = [226, 232, 240]; // #E2E8F0
  const textGray = [113, 128, 150]; // #718096

  // === HEADER ===
  // Title
  const title = settings.title || (isSessionMode ? 'Résultats de session' : 'Ma sélection de mots');
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 32, 44); // Dark text
  doc.text(title, margin, yPosition);
  yPosition += 8;

  // Subtitle
  if (settings.subtitle) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...primaryColor);
    doc.text(settings.subtitle, margin, yPosition);
    yPosition += 8;
  }

  // Meta info (date + word count)
  const metaParts: string[] = [];
  if (settings.includeDate) {
    metaParts.push(`📅 ${new Date().toLocaleDateString('fr-FR')}`);
  }
  if (settings.includeWordCount) {
    metaParts.push(`🏷️  ${words.length} mots sélectionnés`);
  }
  if (metaParts.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(...textGray);
    doc.text(metaParts.join('    '), margin, yPosition);
    yPosition += 5;
  }

  // Gradient border (simulated with violet line)
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 12;

  // === SESSION STATS (only in session mode) ===
  if (isSessionMode) {
    const stats = { validated: 0, failed: 0, neutral: 0, 'not-seen': 0 };
    words.forEach((word, index) => {
      const status = getWordExportStatus(word, index, wordStatuses!, currentIndex!);
      stats[status]++;
    });
    const total = words.length;
    const successRate = total > 0 ? Math.round((stats.validated / total) * 100) : 0;

    // Stats text line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    let statsX = margin;

    // Validated count
    doc.setTextColor(5, 150, 105); // #059669
    doc.text(`${stats.validated} validés`, statsX, yPosition);
    statsX += doc.getTextWidth(`${stats.validated} validés`) + 3;
    doc.setTextColor(...textGray);
    doc.text(' · ', statsX, yPosition);
    statsX += doc.getTextWidth(' · ') + 1;

    // Failed count
    doc.setTextColor(220, 38, 38); // #DC2626
    doc.text(`${stats.failed} ratés`, statsX, yPosition);
    statsX += doc.getTextWidth(`${stats.failed} ratés`) + 3;
    doc.setTextColor(...textGray);
    doc.text(' · ', statsX, yPosition);
    statsX += doc.getTextWidth(' · ') + 1;

    // Neutral count
    doc.setTextColor(100, 116, 139); // #64748B
    doc.text(`${stats.neutral} non notés`, statsX, yPosition);
    statsX += doc.getTextWidth(`${stats.neutral} non notés`) + 3;
    doc.setTextColor(...textGray);
    doc.text(' · ', statsX, yPosition);
    statsX += doc.getTextWidth(' · ') + 1;

    // Not-seen count
    doc.setTextColor(203, 213, 225); // #CBD5E1
    doc.text(`${stats['not-seen']} pas encore vus`, statsX, yPosition);

    yPosition += 6;

    // Success rate
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // #059669
    doc.text(`${successRate}% de réussite`, margin, yPosition);
    yPosition += 10;
  }

  // === LOAD IMAGES ===
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

  // === CONTENT BASED ON LAYOUT ===
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const gap = 5;
    const colWidth = (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
    const cardHeight = hasImages ? 35 : 25;
    const imageSize = settings.layout === 'grid-3col' ? 12 : 16;

    let currentCol = 0;
    let currentRow = 0;

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      let x = margin + currentCol * (colWidth + gap);
      let y = yPosition + currentRow * (cardHeight + gap);

      // Check page break
      if (y + cardHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
        currentRow = 0;
        currentCol = 0;
        x = margin;
        y = yPosition;
      }

      // Get word status for session mode
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

      // Card background (light gray)
      doc.setFillColor(...lightGray);
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, colWidth, cardHeight, 2, 2, 'FD');

      // Left border - use status color in session mode, violet otherwise
      if (statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
      } else {
        doc.setFillColor(...primaryColor);
      }
      doc.rect(x, y, 1, cardHeight, 'F');

      let contentX = x + 5;
      let contentY = y + 6;

      // Status indicator circle (session mode)
      if (isSessionMode && statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
        doc.circle(contentX + 3, contentY + 1, 3, 'F');
        doc.setFontSize(settings.layout === 'grid-3col' ? 7 : 8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(statusColors.symbol, contentX + 3, contentY + 2, { align: 'center' });
        contentX += 10;
      }

      // Number or bullet
      if (settings.numberWords) {
        // Violet circle with number
        doc.setFillColor(...primaryColor);
        doc.circle(contentX + 3, contentY + 1, 3, 'F');
        doc.setFontSize(settings.layout === 'grid-3col' ? 8 : 9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255); // White
        doc.text(`${index + 1}`, contentX + 3, contentY + 2, { align: 'center' });
        contentX += 10;
      } else if (!isSessionMode) {
        doc.setFontSize(14);
        doc.setTextColor(...primaryColor);
        doc.text('•', contentX, contentY + 2);
        contentX += 6;
      }

      // Image
      if (hasImages && imageDataMap.has(word.MOTS)) {
        const imageData = imageDataMap.get(word.MOTS);
        if (imageData) {
          doc.addImage(imageData, 'PNG', contentX, contentY - 2, imageSize, imageSize);
          contentX += imageSize + 3;
        }
      }

      // Word text
      if (settings.display !== 'imageOnly') {
        doc.setFontSize(settings.layout === 'grid-3col' ? 10 : 12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 32, 44);
        doc.text(word.MOTS, contentX, contentY + 3);
        contentY += 6;

        // Phoneme
        if (settings.includePhonemes && word.PHONEMES) {
          doc.setFontSize(settings.layout === 'grid-3col' ? 8 : 9);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(`/${word.PHONEMES}/`, contentX, contentY + 3);
          contentY += 5;
        }

        // Category
        if (settings.includeCategories && word.SYNT) {
          doc.setFontSize(settings.layout === 'grid-3col' ? 7 : 8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(word.SYNT.toUpperCase(), contentX, contentY + 3);
          contentY += 5;
        }

        // Syllable count
        if (settings.includeSyllableCount && word.NBSYLL) {
          doc.setFontSize(settings.layout === 'grid-3col' ? 7 : 8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(`${word.NBSYLL} syll.`, contentX, contentY + 3);
          contentY += 5;
        }

        // Syllable segmentation
        if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
          doc.setFontSize(settings.layout === 'grid-3col' ? 7 : 8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(16, 185, 129); // #10B981
          doc.text(word["segmentation syllabique"], contentX, contentY + 3);
        }
      }

      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    }
  } else if (settings.layout === 'flashcards') {
    // Flashcards: 4-column grid with top accent
    const cols = 4;
    const gap = 5;
    const colWidth = (pageWidth - margin * 2 - gap * (cols - 1)) / cols;
    const cardHeight = hasImages ? 45 : 30;
    const imageSize = colWidth - 8;

    let currentCol = 0;
    let currentRow = 0;

    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      let x = margin + currentCol * (colWidth + gap);
      let y = yPosition + currentRow * (cardHeight + gap);

      // Check page break
      if (y + cardHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
        currentRow = 0;
        currentCol = 0;
        x = margin;
        y = yPosition;
      }

      // Get word status for session mode
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

      // Card background
      doc.setFillColor(...lightGray);
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, colWidth, cardHeight, 2, 2, 'FD');

      // Top accent bar
      if (statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
      } else {
        doc.setFillColor(...primaryColor);
      }
      doc.rect(x, y, colWidth, 1.5, 'F');

      let contentY = y + 5;
      const centerX = x + colWidth / 2;

      // Status badge (session mode)
      if (isSessionMode && statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
        doc.circle(centerX, contentY + 2, 3, 'F');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(statusColors.symbol, centerX, contentY + 3, { align: 'center' });
        contentY += 8;
      }

      // Number (top-left)
      if (settings.numberWords) {
        doc.setFillColor(...primaryColor);
        doc.circle(x + 5, y + 5, 2.5, 'F');
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}`, x + 5, y + 6, { align: 'center' });
      }

      // Image (centered)
      if (hasImages && imageDataMap.has(word.MOTS)) {
        const imageData = imageDataMap.get(word.MOTS);
        if (imageData) {
          const imgW = Math.min(imageSize, colWidth - 8);
          const imgH = Math.min(imgW, 20);
          doc.addImage(imageData, 'PNG', centerX - imgW / 2, contentY, imgW, imgH);
          contentY += imgH + 3;
        }
      }

      // Word text (centered)
      if (settings.display !== 'imageOnly') {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 32, 44);
        doc.text(word.MOTS, centerX, contentY + 3, { align: 'center' });
        contentY += 5;

        // Meta info (centered, stacked)
        if (settings.includePhonemes && word.PHONEMES) {
          doc.setFontSize(7);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(`/${word.PHONEMES}/`, centerX, contentY + 3, { align: 'center' });
          contentY += 4;
        }
        if (settings.includeCategories && word.SYNT) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(word.SYNT, centerX, contentY + 3, { align: 'center' });
          contentY += 4;
        }
        if (settings.includeSyllableCount && word.NBSYLL) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(`${word.NBSYLL} syll.`, centerX, contentY + 3, { align: 'center' });
          contentY += 4;
        }
        if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
          doc.setFontSize(6);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(16, 185, 129);
          doc.text(word["segmentation syllabique"], centerX, contentY + 3, { align: 'center' });
        }
      }

      currentCol++;
      if (currentCol >= cols) {
        currentCol = 0;
        currentRow++;
      }
    }
  } else if (settings.layout === 'table') {
    // Table layout with headers and rows
    const tableLeft = margin;
    const tableWidth = pageWidth - margin * 2;

    // Determine columns
    const columns: { key: string; label: string; width: number }[] = [];
    if (isSessionMode) columns.push({ key: 'status', label: 'Statut', width: 15 });
    if (settings.numberWords) columns.push({ key: 'number', label: '#', width: 12 });
    if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') columns.push({ key: 'image', label: 'Image', width: 20 });
    if (settings.display !== 'imageOnly') columns.push({ key: 'word', label: 'Mot', width: 0 }); // flex
    if (settings.includePhonemes) columns.push({ key: 'phoneme', label: 'Phonème', width: 30 });
    if (settings.includeCategories) columns.push({ key: 'category', label: 'Cat.', width: 15 });
    if (settings.includeSyllableCount) columns.push({ key: 'syllCount', label: 'Syll.', width: 15 });
    if (settings.includeSyllableSegmentation) columns.push({ key: 'syllSeg', label: 'Seg.', width: 25 });

    // Calculate flex column width
    const fixedWidth = columns.filter(c => c.width > 0).reduce((sum, c) => sum + c.width, 0);
    const flexCol = columns.find(c => c.width === 0);
    if (flexCol) flexCol.width = tableWidth - fixedWidth;

    const rowHeight = hasImages ? 18 : 10;
    const headerHeight = 10;

    // Draw header
    doc.setFillColor(...lightGray);
    doc.rect(tableLeft, yPosition, tableWidth, headerHeight, 'F');
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(tableLeft, yPosition + headerHeight, tableLeft + tableWidth, yPosition + headerHeight);

    let colX = tableLeft;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 32, 44);
    for (const col of columns) {
      doc.text(col.label.toUpperCase(), colX + 3, yPosition + 7);
      colX += col.width;
    }
    yPosition += headerHeight + 2;

    // Draw rows
    for (let index = 0; index < words.length; index++) {
      const word = words[index];

      if (yPosition + rowHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

      // Row border
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.line(tableLeft, yPosition + rowHeight, tableLeft + tableWidth, yPosition + rowHeight);

      // Alternating background
      if (index % 2 === 0) {
        doc.setFillColor(252, 252, 253);
        doc.rect(tableLeft, yPosition, tableWidth, rowHeight, 'F');
      }

      colX = tableLeft;
      const textY = yPosition + rowHeight / 2 + 1;

      for (const col of columns) {
        switch (col.key) {
          case 'status':
            if (statusColors) {
              const r = parseInt(statusColors.border.slice(1, 3), 16);
              const g = parseInt(statusColors.border.slice(3, 5), 16);
              const b = parseInt(statusColors.border.slice(5, 7), 16);
              doc.setFillColor(r, g, b);
              doc.circle(colX + col.width / 2, textY - 1, 3, 'F');
              doc.setFontSize(7);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(255, 255, 255);
              doc.text(statusColors.symbol, colX + col.width / 2, textY, { align: 'center' });
            }
            break;
          case 'number':
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...primaryColor);
            doc.text(`${index + 1}`, colX + col.width / 2, textY, { align: 'center' });
            break;
          case 'image':
            if (imageDataMap.has(word.MOTS)) {
              const imageData = imageDataMap.get(word.MOTS);
              if (imageData) {
                const imgSize = Math.min(rowHeight - 2, 14);
                doc.addImage(imageData, 'PNG', colX + 3, yPosition + 1, imgSize, imgSize);
              }
            }
            break;
          case 'word':
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(26, 32, 44);
            doc.text(word.MOTS, colX + 3, textY);
            break;
          case 'phoneme':
            doc.setFontSize(8);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...primaryColor);
            doc.text(word.PHONEMES ? `/${word.PHONEMES}/` : '', colX + 3, textY);
            break;
          case 'category':
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(word.SYNT || '', colX + 3, textY);
            break;
          case 'syllCount':
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...textGray);
            doc.text(word.NBSYLL ? `${word.NBSYLL}` : '', colX + 3, textY);
            break;
          case 'syllSeg':
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(16, 185, 129);
            doc.text(word["segmentation syllabique"] || '', colX + 3, textY);
            break;
        }
        colX += col.width;
      }

      yPosition += rowHeight;
    }
  } else {
    // List layout (1 column) — default
    const cardHeight = hasImages ? 30 : 18;
    const imageSize = 16;

    for (let index = 0; index < words.length; index++) {
      const word = words[index];

      // Check page break
      if (yPosition + cardHeight > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      // Get word status for session mode
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

      const x = margin;
      const y = yPosition;

      // Card background
      doc.setFillColor(...lightGray);
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.roundedRect(x, y, pageWidth - margin * 2, cardHeight, 2, 2, 'FD');

      // Left border - use status color in session mode, violet otherwise
      if (statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
      } else {
        doc.setFillColor(...primaryColor);
      }
      doc.rect(x, y, 1, cardHeight, 'F');

      let contentX = x + 5;
      let contentY = y + cardHeight / 2;

      // Status indicator circle (session mode)
      if (isSessionMode && statusColors) {
        const r = parseInt(statusColors.border.slice(1, 3), 16);
        const g = parseInt(statusColors.border.slice(3, 5), 16);
        const b = parseInt(statusColors.border.slice(5, 7), 16);
        doc.setFillColor(r, g, b);
        doc.circle(contentX + 3, contentY, 3, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(statusColors.symbol, contentX + 3, contentY + 1, { align: 'center' });
        contentX += 10;
      }

      // Number or bullet
      if (settings.numberWords) {
        doc.setFillColor(...primaryColor);
        doc.circle(contentX + 3, contentY, 3, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}`, contentX + 3, contentY + 1, { align: 'center' });
        contentX += 10;
      } else if (!isSessionMode) {
        doc.setFontSize(16);
        doc.setTextColor(...primaryColor);
        doc.text('•', contentX, contentY + 1);
        contentX += 8;
      }

      // Image
      if (hasImages && imageDataMap.has(word.MOTS)) {
        const imageData = imageDataMap.get(word.MOTS);
        if (imageData) {
          doc.addImage(imageData, 'PNG', contentX, contentY - imageSize / 2, imageSize, imageSize);
          contentX += imageSize + 5;
        }
      }

      // Word text
      if (settings.display !== 'imageOnly') {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 32, 44);
        doc.text(word.MOTS, contentX, contentY);

        // Phoneme & Category on same line
        let extraX = contentX + doc.getTextWidth(word.MOTS) + 5;
        if (settings.includePhonemes && word.PHONEMES) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(`/${word.PHONEMES}/`, extraX, contentY);
          extraX += doc.getTextWidth(`/${word.PHONEMES}/`) + 5;
        }
        if (settings.includeCategories && word.SYNT) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(`(${word.SYNT})`, extraX, contentY);
          extraX += doc.getTextWidth(`(${word.SYNT})`) + 5;
        }
        if (settings.includeSyllableCount && word.NBSYLL) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...textGray);
          doc.text(`${word.NBSYLL} syll.`, extraX, contentY);
          extraX += doc.getTextWidth(`${word.NBSYLL} syll.`) + 5;
        }
        if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(16, 185, 129); // #10B981
          doc.text(word["segmentation syllabique"], extraX, contentY);
        }
      }

      yPosition += cardHeight + 4;
    }
  }

  // === FOOTER ===
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(160, 174, 192);
  doc.text('Généré depuis La Boîte à mots', pageWidth / 2, pageHeight - 10, { align: 'center' });

  const filename = `mots-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export async function exportToWord(words: Word[], settings: ExportSettings, wordStatuses?: Map<string, WordStatus>, currentIndex?: number): Promise<void> {
  const children: (Paragraph | Table)[] = [];
  const isSessionMode = !!wordStatuses;

  // Clinical Elegance violet color
  const primaryColor = '6C5CE7'; // Violet
  const textGray = '718096';

  // === HEADER ===
  const wordTitle = settings.title || (isSessionMode ? 'Résultats de session' : 'Ma sélection de mots');

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: wordTitle,
          bold: true,
          size: 32, // 16pt
          color: '1A202C', // Dark
        }),
      ],
      spacing: { after: 150 },
    })
  );

  // Subtitle
  if (settings.subtitle) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: settings.subtitle,
            size: 22, // 11pt
            color: primaryColor,
          }),
        ],
        spacing: { after: 150 },
      })
    );
  }

  // Meta info
  const metaRuns: TextRun[] = [];
  if (settings.includeDate) {
    metaRuns.push(
      new TextRun({
        text: `📅 ${new Date().toLocaleDateString('fr-FR')}    `,
        size: 20,
        color: textGray,
      })
    );
  }
  if (settings.includeWordCount) {
    metaRuns.push(
      new TextRun({
        text: `🏷️  ${words.length} mots sélectionnés`,
        size: 20,
        color: textGray,
      })
    );
  }
  if (metaRuns.length > 0) {
    children.push(
      new Paragraph({
        children: metaRuns,
        spacing: { after: 100 },
      })
    );
  }

  // Separator line (using border)
  children.push(
    new Paragraph({
      text: '',
      border: {
        bottom: {
          color: primaryColor,
          space: 1,
          style: 'single',
          size: 6,
        },
      },
      spacing: { after: 300 },
    })
  );

  // === SESSION STATS (only in session mode) ===
  if (isSessionMode) {
    const stats = { validated: 0, failed: 0, neutral: 0, 'not-seen': 0 };
    words.forEach((word, index) => {
      const status = getWordExportStatus(word, index, wordStatuses!, currentIndex!);
      stats[status]++;
    });
    const total = words.length;
    const successRate = total > 0 ? Math.round((stats.validated / total) * 100) : 0;

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${stats.validated} validés`,
            color: STATUS_COLORS.validated.text.slice(1), // remove #
            size: 20,
          }),
          new TextRun({
            text: ' · ',
            color: textGray,
            size: 20,
          }),
          new TextRun({
            text: `${stats.failed} ratés`,
            color: STATUS_COLORS.failed.text.slice(1),
            size: 20,
          }),
          new TextRun({
            text: ' · ',
            color: textGray,
            size: 20,
          }),
          new TextRun({
            text: `${stats.neutral} non notés`,
            color: STATUS_COLORS.neutral.text.slice(1),
            size: 20,
          }),
          new TextRun({
            text: ' · ',
            color: textGray,
            size: 20,
          }),
          new TextRun({
            text: `${stats['not-seen']} pas encore vus`,
            color: STATUS_COLORS['not-seen'].text.slice(1),
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${successRate}% de réussite`,
            bold: true,
            color: STATUS_COLORS.validated.text.slice(1),
            size: 22,
          }),
        ],
        spacing: { after: 300 },
      })
    );
  }

  // === LOAD IMAGES ===
  const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
  const imageDataMap = new Map<string, Uint8Array>();

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

  // === CONTENT BASED ON LAYOUT ===
  if (settings.layout === 'grid-2col' || settings.layout === 'grid-3col') {
    const cols = settings.layout === 'grid-2col' ? 2 : 3;
    const rows: TableRow[] = [];
    const imageSize = settings.layout === 'grid-3col' ? 60 : 80;

    for (let i = 0; i < words.length; i += cols) {
      const cells: TableCell[] = [];

      for (let j = 0; j < cols; j++) {
        const word = words[i + j];
        const index = i + j;

        if (word) {
          const cellChildren: (Paragraph | ImageRun)[] = [];
          const textRuns: (TextRun | ImageRun)[] = [];

          // Get word status for session mode
          const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
          const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

          // Status symbol (session mode)
          if (isSessionMode && statusColors) {
            textRuns.push(
              new TextRun({
                text: `${statusColors.symbol} `,
                bold: true,
                color: statusColors.text.slice(1),
                size: settings.layout === 'grid-3col' ? 20 : 24,
              })
            );
          }

          // Number or bullet
          if (settings.numberWords) {
            textRuns.push(
              new TextRun({
                text: `${index + 1}. `,
                bold: true,
                color: primaryColor,
              })
            );
          } else if (!isSessionMode) {
            textRuns.push(
              new TextRun({
                text: '• ',
                bold: true,
                color: primaryColor,
                size: 24,
              })
            );
          }

          // Image
          if (hasImages && imageDataMap.has(word.MOTS)) {
            const imageData = imageDataMap.get(word.MOTS);
            if (imageData) {
              cellChildren.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData,
                      transformation: {
                        width: imageSize,
                        height: imageSize,
                      },
                    }),
                  ],
                  spacing: { after: 100 },
                })
              );
            }
          }

          // Word text
          if (settings.display !== 'imageOnly') {
            textRuns.push(
              new TextRun({
                text: word.MOTS,
                bold: true,
                size: settings.layout === 'grid-3col' ? 20 : 24,
              })
            );
          }

          // Phoneme
          if (settings.includePhonemes && word.PHONEMES) {
            textRuns.push(
              new TextRun({
                text: ` /${word.PHONEMES}/`,
                italics: true,
                color: primaryColor,
                size: settings.layout === 'grid-3col' ? 18 : 20,
              })
            );
          }

          // Category
          if (settings.includeCategories && word.SYNT) {
            textRuns.push(
              new TextRun({
                text: ` ${word.SYNT.toUpperCase()}`,
                color: textGray,
                size: settings.layout === 'grid-3col' ? 16 : 18,
              })
            );
          }

          // Syllable count
          if (settings.includeSyllableCount && word.NBSYLL) {
            textRuns.push(
              new TextRun({
                text: ` ${word.NBSYLL} syll.`,
                color: textGray,
                size: settings.layout === 'grid-3col' ? 16 : 18,
              })
            );
          }

          // Syllable segmentation
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            textRuns.push(
              new TextRun({
                text: ` ${word["segmentation syllabique"]}`,
                color: '10B981',
                size: settings.layout === 'grid-3col' ? 16 : 18,
              })
            );
          }

          if (textRuns.length > 0) {
            cellChildren.push(
              new Paragraph({
                children: textRuns,
              })
            );
          }

          // Left border color - use status color in session mode, violet otherwise
          const leftBorderColor = (isSessionMode && statusColors) ? statusColors.border.slice(1) : primaryColor;

          cells.push(
            new TableCell({
              children: cellChildren,
              width: { size: 100 / cols, type: WidthType.PERCENTAGE },
              margins: {
                top: 150,
                bottom: 150,
                left: 150,
                right: 150,
              },
              shading: {
                fill: 'FAFBFC', // Light gray background
              },
              borders: {
                top: { style: 'single', size: 1, color: 'E2E8F0' },
                bottom: { style: 'single', size: 1, color: 'E2E8F0' },
                left: { style: 'single', size: 6, color: leftBorderColor }, // Status or violet left border
                right: { style: 'single', size: 1, color: 'E2E8F0' },
              },
            })
          );
        } else {
          // Empty cell
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
  } else if (settings.layout === 'flashcards') {
    // Flashcards: 4-column table with centered content
    const cols = 4;
    const rows: TableRow[] = [];
    const imageSize = 50;

    for (let i = 0; i < words.length; i += cols) {
      const cells: TableCell[] = [];

      for (let j = 0; j < cols; j++) {
        const word = words[i + j];
        const index = i + j;

        if (word) {
          const cellChildren: Paragraph[] = [];

          const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
          const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;
          const topBorderColor = (isSessionMode && statusColors) ? statusColors.border.slice(1) : primaryColor;

          // Status badge
          if (isSessionMode && statusColors) {
            cellChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: statusColors.symbol,
                    bold: true,
                    color: statusColors.text.slice(1),
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 },
              })
            );
          }

          // Number
          if (settings.numberWords) {
            cellChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}`,
                    bold: true,
                    color: primaryColor,
                    size: 16,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 },
              })
            );
          }

          // Image
          if (hasImages && imageDataMap.has(word.MOTS)) {
            const imageData = imageDataMap.get(word.MOTS);
            if (imageData) {
              cellChildren.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imageData,
                      transformation: { width: imageSize, height: imageSize },
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 80 },
                })
              );
            }
          }

          // Word text
          if (settings.display !== 'imageOnly') {
            cellChildren.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: word.MOTS,
                    bold: true,
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 50 },
              })
            );
          }

          // Meta info
          const metaRuns: TextRun[] = [];
          if (settings.includePhonemes && word.PHONEMES) {
            metaRuns.push(new TextRun({ text: `/${word.PHONEMES}/`, italics: true, color: primaryColor, size: 16 }));
          }
          if (settings.includeCategories && word.SYNT) {
            if (metaRuns.length > 0) metaRuns.push(new TextRun({ text: ' ', size: 16 }));
            metaRuns.push(new TextRun({ text: word.SYNT, color: textGray, size: 16 }));
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            if (metaRuns.length > 0) metaRuns.push(new TextRun({ text: ' ', size: 16 }));
            metaRuns.push(new TextRun({ text: `${word.NBSYLL} syll.`, color: textGray, size: 16 }));
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            if (metaRuns.length > 0) metaRuns.push(new TextRun({ text: ' ', size: 16 }));
            metaRuns.push(new TextRun({ text: word["segmentation syllabique"], color: '10B981', size: 16 }));
          }
          if (metaRuns.length > 0) {
            cellChildren.push(new Paragraph({ children: metaRuns, alignment: AlignmentType.CENTER }));
          }

          cells.push(
            new TableCell({
              children: cellChildren,
              width: { size: 25, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 120, left: 80, right: 80 },
              shading: { fill: 'FAFBFC' },
              borders: {
                top: { style: 'single', size: 6, color: topBorderColor },
                bottom: { style: 'single', size: 1, color: 'E2E8F0' },
                left: { style: 'single', size: 1, color: 'E2E8F0' },
                right: { style: 'single', size: 1, color: 'E2E8F0' },
              },
            })
          );
        } else {
          cells.push(
            new TableCell({
              children: [new Paragraph('')],
              width: { size: 25, type: WidthType.PERCENTAGE },
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
  } else if (settings.layout === 'table') {
    // Table layout with proper headers and data rows
    const headerCells: TableCell[] = [];
    const colKeys: string[] = [];

    // Build header
    if (isSessionMode) {
      colKeys.push('status');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'STATUT', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.numberWords) {
      colKeys.push('number');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, size: 16, color: '1A202C' })], alignment: AlignmentType.CENTER })],
        shading: { fill: 'FAFBFC' },
        width: { size: 8, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
      colKeys.push('image');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'IMAGE', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.display !== 'imageOnly') {
      colKeys.push('word');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'MOT', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.includePhonemes) {
      colKeys.push('phoneme');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'PHONÈME', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.includeCategories) {
      colKeys.push('category');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'CAT.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.includeSyllableCount) {
      colKeys.push('syllCount');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'SYLL.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }
    if (settings.includeSyllableSegmentation) {
      colKeys.push('syllSeg');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'SEG.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
      }));
    }

    const tableRows: TableRow[] = [
      new TableRow({
        children: headerCells,
        tableHeader: true,
      }),
    ];

    // Data rows
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;
      const rowCells: TableCell[] = [];
      const rowShading = index % 2 === 0 ? 'FCFCFD' : 'FFFFFF';

      for (const key of colKeys) {
        let cellContent: Paragraph;
        switch (key) {
          case 'status':
            cellContent = new Paragraph({
              children: statusColors ? [new TextRun({ text: statusColors.symbol, bold: true, color: statusColors.text.slice(1), size: 20 })] : [],
              alignment: AlignmentType.CENTER,
            });
            break;
          case 'number':
            cellContent = new Paragraph({
              children: [new TextRun({ text: `${index + 1}`, bold: true, color: primaryColor, size: 18 })],
              alignment: AlignmentType.CENTER,
            });
            break;
          case 'image':
            if (imageDataMap.has(word.MOTS)) {
              const imageData = imageDataMap.get(word.MOTS);
              cellContent = new Paragraph({
                children: imageData ? [new ImageRun({ data: imageData, transformation: { width: 40, height: 40 } })] : [],
              });
            } else {
              cellContent = new Paragraph('');
            }
            break;
          case 'word':
            cellContent = new Paragraph({
              children: [new TextRun({ text: word.MOTS, bold: true, size: 20 })],
            });
            break;
          case 'phoneme':
            cellContent = new Paragraph({
              children: [new TextRun({ text: word.PHONEMES ? `/${word.PHONEMES}/` : '', italics: true, color: primaryColor, size: 18 })],
            });
            break;
          case 'category':
            cellContent = new Paragraph({
              children: [new TextRun({ text: word.SYNT || '', color: textGray, size: 18 })],
            });
            break;
          case 'syllCount':
            cellContent = new Paragraph({
              children: [new TextRun({ text: word.NBSYLL ? `${word.NBSYLL}` : '', color: textGray, size: 18 })],
            });
            break;
          case 'syllSeg':
            cellContent = new Paragraph({
              children: [new TextRun({ text: word["segmentation syllabique"] || '', color: '10B981', size: 18 })],
            });
            break;
          default:
            cellContent = new Paragraph('');
        }

        rowCells.push(
          new TableCell({
            children: [cellContent],
            shading: { fill: rowShading },
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            borders: {
              bottom: { style: 'single', size: 1, color: 'E2E8F0' },
            },
          })
        );
      }

      tableRows.push(new TableRow({ children: rowCells }));
    }

    children.push(
      new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
      })
    );
  } else {
    // List layout (1 column) — default
    for (let index = 0; index < words.length; index++) {
      const word = words[index];
      const paragraphChildren: (TextRun | ImageRun)[] = [];

      // Get word status for session mode
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

      // Status symbol (session mode)
      if (isSessionMode && statusColors) {
        paragraphChildren.push(
          new TextRun({
            text: `${statusColors.symbol} `,
            bold: true,
            color: statusColors.text.slice(1),
            size: 24,
          })
        );
      }

      // Number or bullet
      if (settings.numberWords) {
        paragraphChildren.push(
          new TextRun({
            text: `${index + 1}. `,
            bold: true,
            color: primaryColor,
          })
        );
      } else if (!isSessionMode) {
        paragraphChildren.push(
          new TextRun({
            text: '• ',
            bold: true,
            color: primaryColor,
            size: 28,
          })
        );
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
        paragraphChildren.push(
          new TextRun({
            text: word.MOTS,
            bold: true,
            size: 24,
          })
        );
      }

      // Phoneme
      if (settings.includePhonemes && word.PHONEMES) {
        paragraphChildren.push(
          new TextRun({
            text: ` /${word.PHONEMES}/`,
            italics: true,
            color: primaryColor,
            size: 20,
          })
        );
      }

      // Category
      if (settings.includeCategories && word.SYNT) {
        paragraphChildren.push(
          new TextRun({
            text: ` (${word.SYNT})`,
            color: textGray,
            size: 18,
          })
        );
      }

      // Syllable count
      if (settings.includeSyllableCount && word.NBSYLL) {
        paragraphChildren.push(
          new TextRun({
            text: ` ${word.NBSYLL} syll.`,
            color: textGray,
            size: 18,
          })
        );
      }

      // Syllable segmentation
      if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
        paragraphChildren.push(
          new TextRun({
            text: ` ${word["segmentation syllabique"]}`,
            color: '10B981',
            size: 18,
          })
        );
      }

      // Left border color - use status color in session mode, violet otherwise
      const leftBorderColor = (isSessionMode && statusColors) ? statusColors.border.slice(1) : primaryColor;

      children.push(
        new Paragraph({
          children: paragraphChildren,
          spacing: { after: 200 },
          shading: {
            fill: 'FAFBFC', // Light gray background
          },
          border: {
            left: {
              color: leftBorderColor,
              space: 1,
              style: 'single',
              size: 12, // Status or violet left border
            },
            top: {
              color: 'E2E8F0',
              space: 1,
              style: 'single',
              size: 3,
            },
            bottom: {
              color: 'E2E8F0',
              space: 1,
              style: 'single',
              size: 3,
            },
            right: {
              color: 'E2E8F0',
              space: 1,
              style: 'single',
              size: 3,
            },
          },
          indent: {
            left: 200,
            right: 200,
          },
        })
      );
    }
  }

  // === FOOTER ===
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Généré depuis La Boîte à mots',
          italics: true,
          color: 'A0AEC0', // Light gray
          size: 18,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600 },
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

export function exportToPrint(words: Word[], settings: ExportSettings, wordStatuses?: Map<string, WordStatus>, currentIndex?: number): void {
  const isSessionMode = !!wordStatuses;
  // Create print content
  let html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${settings.title || (isSessionMode ? 'Résultats de session' : 'Ma sélection de mots')}</title>
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

        .meta-emoji {
          font-size: 14px;
          line-height: 1;
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

        .word-syllable-count {
          font-size: 12px;
          color: var(--color-text-secondary);
        }

        .word-segmentation {
          font-size: 12px;
          color: #10B981;
          font-family: monospace;
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

        /* Session Stats Section */
        .session-stats {
          margin-bottom: 32px;
          padding: 20px 24px;
          background: linear-gradient(135deg, #FAFBFC 0%, #FFFFFF 100%);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }

        .session-progress-bar {
          display: flex;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 14px;
          background: #F1F5F9;
        }

        .session-progress-bar .segment-validated {
          background: #10B981;
        }

        .session-progress-bar .segment-failed {
          background: #F87171;
        }

        .session-progress-bar .segment-neutral {
          background: #94A3B8;
        }

        .session-progress-bar .segment-not-seen {
          background: #E2E8F0;
        }

        .session-counters {
          font-size: 13px;
          color: var(--color-text-secondary);
          margin-bottom: 6px;
        }

        .session-counters .count-validated { color: #059669; font-weight: 500; }
        .session-counters .count-failed { color: #DC2626; font-weight: 500; }
        .session-counters .count-neutral { color: #64748B; font-weight: 500; }
        .session-counters .count-not-seen { color: #CBD5E1; font-weight: 500; }
        .session-counters .separator { color: #94A3B8; margin: 0 6px; }

        .session-success-rate {
          font-size: 15px;
          font-weight: 600;
          color: #059669;
        }

        /* Status indicator badge */
        .status-badge {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          line-height: 1;
        }

        .status-badge-validated { background: #ECFDF5; border: 2px solid #10B981; color: #059669; }
        .status-badge-failed { background: #FEF2F2; border: 2px solid #F87171; color: #DC2626; }
        .status-badge-neutral { background: #F8FAFC; border: 2px solid #94A3B8; color: #64748B; }
        .status-badge-not-seen { background: #F9FAFB; border: 2px solid #E2E8F0; color: #CBD5E1; }

        /* Status left border overrides */
        .word-item-list.status-validated::before,
        .word-card.status-validated::before { background: #10B981 !important; }
        .word-item-list.status-failed::before,
        .word-card.status-failed::before { background: #F87171 !important; }
        .word-item-list.status-neutral::before,
        .word-card.status-neutral::before { background: #94A3B8 !important; }
        .word-item-list.status-not-seen::before,
        .word-card.status-not-seen::before { background: #E2E8F0 !important; }

        /* Flashcard status top border overrides */
        .flashcard.status-validated::before { background: #10B981 !important; }
        .flashcard.status-failed::before { background: #F87171 !important; }
        .flashcard.status-neutral::before { background: #94A3B8 !important; }
        .flashcard.status-not-seen::before { background: #E2E8F0 !important; }

        /* Table status indicator */
        .table-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 12px;
          line-height: 1;
        }

        .table-status-validated { background: #ECFDF5; border: 2px solid #10B981; color: #059669; }
        .table-status-failed { background: #FEF2F2; border: 2px solid #F87171; color: #DC2626; }
        .table-status-neutral { background: #F8FAFC; border: 2px solid #94A3B8; color: #64748B; }
        .table-status-not-seen { background: #F9FAFB; border: 2px solid #E2E8F0; color: #CBD5E1; }
      </style>
    </head>
    <body>
  `;

  html += `
    <header class="document-header">
      <h1 class="header-title">${settings.title || (isSessionMode ? 'Résultats de session' : 'Ma sélection de mots')}</h1>
      ${settings.subtitle ? `<p class="header-subtitle">${settings.subtitle}</p>` : ''}
      <div class="header-meta">
  `;

  if (settings.includeDate) {
    html += `
        <div class="meta-item">
          <span class="meta-emoji">&#x1F4C5;</span>
          <span>${new Date().toLocaleDateString('fr-FR')}</span>
        </div>
    `;
  }

  if (settings.includeWordCount) {
    html += `
        <div class="meta-item">
          <span class="meta-emoji">&#x1F3F7;&#xFE0F;</span>
          <span>${words.length} mots sélectionnés</span>
        </div>
    `;
  }

  html += `
      </div>
    </header>
  `;

  // === SESSION STATS (only in session mode) ===
  if (isSessionMode) {
    const stats = { validated: 0, failed: 0, neutral: 0, 'not-seen': 0 };
    words.forEach((word, index) => {
      const status = getWordExportStatus(word, index, wordStatuses!, currentIndex!);
      stats[status]++;
    });
    const total = words.length;
    const successRate = total > 0 ? Math.round((stats.validated / total) * 100) : 0;

    const validatedPct = total > 0 ? (stats.validated / total) * 100 : 0;
    const failedPct = total > 0 ? (stats.failed / total) * 100 : 0;
    const neutralPct = total > 0 ? (stats.neutral / total) * 100 : 0;
    const notSeenPct = total > 0 ? (stats['not-seen'] / total) * 100 : 0;

    html += `
      <div class="session-stats">
        <div class="session-progress-bar">
          ${validatedPct > 0 ? `<div class="segment-validated" style="width: ${validatedPct}%"></div>` : ''}
          ${failedPct > 0 ? `<div class="segment-failed" style="width: ${failedPct}%"></div>` : ''}
          ${neutralPct > 0 ? `<div class="segment-neutral" style="width: ${neutralPct}%"></div>` : ''}
          ${notSeenPct > 0 ? `<div class="segment-not-seen" style="width: ${notSeenPct}%"></div>` : ''}
        </div>
        <div class="session-counters">
          <span class="count-validated">${stats.validated} validés</span>
          <span class="separator">·</span>
          <span class="count-failed">${stats.failed} ratés</span>
          <span class="separator">·</span>
          <span class="count-neutral">${stats.neutral} non notés</span>
          <span class="separator">·</span>
          <span class="count-not-seen">${stats['not-seen']} pas encore vus</span>
        </div>
        <div class="session-success-rate">${successRate}% de réussite</div>
      </div>
    `;
  }

  // Generate content based on layout
  if (settings.layout === 'list-1col') {
    html += `<div class="word-list-1col">`;

    words.forEach((word, index) => {
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusClass = wordStatus ? ` status-${wordStatus}` : '';

      html += `
        <div class="word-item-list${statusClass}">
          ${isSessionMode && wordStatus ? `<div class="status-badge status-badge-${wordStatus}">${STATUS_COLORS[wordStatus].symbol}</div>` : ''}
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : (!isSessionMode ? `<div class="word-bullet">•</div>` : '')
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

        if (settings.includePhonemes || settings.includeCategories || settings.includeSyllableCount || settings.includeSyllableSegmentation) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            html += `<span class="word-syllable-count">${word.NBSYLL} syll.</span>`;
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            html += `<span class="word-segmentation">${word["segmentation syllabique"]}</span>`;
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
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusClass = wordStatus ? ` status-${wordStatus}` : '';

      html += `
        <div class="word-card${statusClass}">
          ${isSessionMode && wordStatus ? `<div class="status-badge status-badge-${wordStatus}">${STATUS_COLORS[wordStatus].symbol}</div>` : ''}
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : (!isSessionMode ? `<div class="word-bullet">•</div>` : '')
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

        if (settings.includePhonemes || settings.includeCategories || settings.includeSyllableCount || settings.includeSyllableSegmentation) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            html += `<span class="word-syllable-count">${word.NBSYLL} syll.</span>`;
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            html += `<span class="word-segmentation">${word["segmentation syllabique"]}</span>`;
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
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusClass = wordStatus ? ` status-${wordStatus}` : '';

      html += `
        <div class="word-card${statusClass}">
          ${isSessionMode && wordStatus ? `<div class="status-badge status-badge-${wordStatus}">${STATUS_COLORS[wordStatus].symbol}</div>` : ''}
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : (!isSessionMode ? `<div class="word-bullet">•</div>` : '')
          }
          <div class="word-card-content">
      `;

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-card" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories || settings.includeSyllableCount || settings.includeSyllableSegmentation) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            html += `<span class="word-syllable-count">${word.NBSYLL} syll.</span>`;
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            html += `<span class="word-segmentation">${word["segmentation syllabique"]}</span>`;
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
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusClass = wordStatus ? ` status-${wordStatus}` : '';

      html += `<div class="flashcard${statusClass}">`;

      if (isSessionMode && wordStatus) {
        html += `<div class="status-badge status-badge-${wordStatus}" style="margin-bottom: 4px;">${STATUS_COLORS[wordStatus].symbol}</div>`;
      }

      if (settings.numberWords) {
        html += `<div class="flashcard-number">${index + 1}</div>`;
      }

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="flashcard-image" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="flashcard-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories || settings.includeSyllableCount || settings.includeSyllableSegmentation) {
          html += `<div class="flashcard-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="flashcard-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="flashcard-category">${word.SYNT}</span>`;
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            html += `<span class="word-syllable-count">${word.NBSYLL} syll.</span>`;
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            html += `<span class="word-segmentation">${word["segmentation syllabique"]}</span>`;
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

    if (isSessionMode) {
      html += `<th>Statut</th>`;
    }

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

    if (settings.includeSyllableCount) {
      html += `<th>Syllabes</th>`;
    }

    if (settings.includeSyllableSegmentation) {
      html += `<th>Segmentation</th>`;
    }

    html += `</tr></thead>`;
    html += `<tbody>`;

    words.forEach((word, index) => {
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;

      html += `<tr>`;

      if (isSessionMode && wordStatus) {
        html += `<td style="text-align: center;"><span class="table-status table-status-${wordStatus}">${STATUS_COLORS[wordStatus].symbol}</span></td>`;
      }

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

      if (settings.includeSyllableCount) {
        html += `<td class="word-syllable-count">${word.NBSYLL || ''}</td>`;
      }

      if (settings.includeSyllableSegmentation) {
        html += `<td class="word-segmentation">${word["segmentation syllabique"] || ''}</td>`;
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
      const wordStatus = isSessionMode ? getWordExportStatus(word, index, wordStatuses!, currentIndex!) : null;
      const statusClass = wordStatus ? ` status-${wordStatus}` : '';

      html += `
        <div class="word-item-list${statusClass}">
          ${isSessionMode && wordStatus ? `<div class="status-badge status-badge-${wordStatus}">${STATUS_COLORS[wordStatus].symbol}</div>` : ''}
          ${settings.numberWords
            ? `<div class="word-number">${index + 1}</div>`
            : (!isSessionMode ? `<div class="word-bullet">•</div>` : '')
          }
          <div class="word-content-list">
      `;

      if ((settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"]) {
        html += `<img src="${word["image associée"]}" alt="${word.MOTS}" class="word-image-list" />`;
      }

      if (settings.display !== 'imageOnly') {
        html += `<div class="word-details">`;
        html += `<div class="word-text">${word.MOTS}</div>`;

        if (settings.includePhonemes || settings.includeCategories || settings.includeSyllableCount || settings.includeSyllableSegmentation) {
          html += `<div class="word-meta">`;
          if (settings.includePhonemes && word.PHONEMES) {
            html += `<span class="word-phoneme">/${word.PHONEMES}/</span>`;
          }
          if (settings.includeCategories && word.SYNT) {
            html += `<span class="word-category">${word.SYNT}</span>`;
          }
          if (settings.includeSyllableCount && word.NBSYLL) {
            html += `<span class="word-syllable-count">${word.NBSYLL} syll.</span>`;
          }
          if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
            html += `<span class="word-segmentation">${word["segmentation syllabique"]}</span>`;
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
      <div class="footer-brand">Généré depuis La Boîte à mots</div>
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

    // Flag to prevent double print
    let printCalled = false;

    const doPrint = () => {
      if (printCalled) return;
      printCalled = true;

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      // Remove iframe after printing
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };

    // Wait for content to load then print
    iframe.onload = () => {
      setTimeout(doPrint, 250);
    };

    // Fallback if onload doesn't fire
    setTimeout(doPrint, 500);
  }
}
