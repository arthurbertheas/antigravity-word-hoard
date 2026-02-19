import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { Word } from '@/types/word';
import { ExportSettings, STATUS_COLORS, getWordExportStatus } from '@/types/export';
import { WordStatus } from '@/contexts/PlayerContext';

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
    const headerBorders = {
      top: { style: 'single' as const, size: 1, color: 'E2E8F0' },
      bottom: { style: 'single' as const, size: 6, color: primaryColor },
      left: { style: 'single' as const, size: 1, color: 'E2E8F0' },
      right: { style: 'single' as const, size: 1, color: 'E2E8F0' },
    };

    if (isSessionMode) {
      colKeys.push('status');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'STATUT', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.numberWords) {
      colKeys.push('number');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: '#', bold: true, size: 16, color: '1A202C' })], alignment: AlignmentType.CENTER })],
        shading: { fill: 'FAFBFC' },
        width: { size: 8, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.display === 'imageOnly' || settings.display === 'wordAndImage') {
      colKeys.push('image');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'IMAGE', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.display !== 'imageOnly') {
      colKeys.push('word');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'MOT', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.includePhonemes) {
      colKeys.push('phoneme');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'PHONÈME', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.includeCategories) {
      colKeys.push('category');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'CAT.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.includeSyllableCount) {
      colKeys.push('syllCount');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'SYLL.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
      }));
    }
    if (settings.includeSyllableSegmentation) {
      colKeys.push('syllSeg');
      headerCells.push(new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: 'SEG.', bold: true, size: 16, color: '1A202C' })] })],
        shading: { fill: 'FAFBFC' },
        margins: { top: 80, bottom: 80, left: 100, right: 100 },
        borders: headerBorders,
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
              top: { style: 'single', size: 1, color: 'E2E8F0' },
              bottom: { style: 'single', size: 1, color: 'E2E8F0' },
              left: { style: 'single', size: 1, color: 'E2E8F0' },
              right: { style: 'single', size: 1, color: 'E2E8F0' },
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

