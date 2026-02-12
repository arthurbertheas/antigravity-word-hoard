import { SavedList } from '@/lib/supabase';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// --- PDF Export ---
export const exportToPdf = (list: SavedList) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(list.name, margin, 20);

    // Tags
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const tagsText = list.tags && list.tags.length > 0 ? list.tags.join(', ') : 'Sans étiquette';
    doc.text(tagsText, margin, 30);

    // Word Count
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`${list.words.length} mots`, margin, 40);

    // Divider line
    doc.setDrawColor(200);
    doc.line(margin, 45, pageWidth - margin, 45);

    // Words List
    let yPos = 55;
    const lineHeight = 8;
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFontSize(12);
    list.words.forEach((word) => {
        // Check for page break
        if (yPos > pageHeight - margin) {
            doc.addPage();
            yPos = 20;
        }
        doc.text(`• ${word.MOTS}`, margin + 5, yPos);
        yPos += lineHeight;
    });

    // Footer
    const footerText = "Généré depuis Ressources Orthophonie";
    doc.setFontSize(10);
    doc.setTextColor(150);
    // Add page break checks for footer too if list is long? 
    // Usually footer is at bottom of page. 
    // For simplicity, we add it at the end for now or fixed bottom.
    // Let's put a line at the end of the list

    // Check if we need a new page for the footer line
    if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
    }

    doc.setDrawColor(200);
    doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
    doc.text(footerText, margin, yPos + 12);

    doc.save(`${list.name}.pdf`);
};

// --- Word Export ---
export const exportToWord = async (list: SavedList) => {
    const wordsParagraphs = list.words.map(word =>
        new Paragraph({
            children: [
                new TextRun({
                    text: `• ${word.MOTS}`,
                    size: 24, // 12pt
                }),
            ],
            spacing: {
                after: 120, // 6pt
            },
            indent: {
                left: 720, // 0.5 inch
            }
        })
    );

    const doc = new Document({
        sections: [{
            children: [
                new Paragraph({
                    text: list.name,
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: list.tags && list.tags.length > 0 ? list.tags.join(', ') : 'Sans étiquette',
                            color: "666666",
                            size: 24 // 12pt
                        })
                    ],
                    spacing: { after: 120 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `${list.words.length} mots`,
                            bold: true,
                            size: 22 // 11pt
                        })
                    ],
                    spacing: { after: 240 }
                }),
                // Horizontal Line equivalent (using border on a paragraph or just spacing)
                // Docx doesn't have a simple <hr>, using a border bottom on an empty paragraph is a trick,
                // or just spacing. Let's stick to spacing for simplicity/robustness.
                new Paragraph({
                    text: "",
                    border: {
                        bottom: {
                            color: "CCCCCC",
                            space: 1,
                            style: "single",
                            size: 6
                        }
                    },
                    spacing: { after: 240 }
                }),
                ...wordsParagraphs,
                new Paragraph({
                    text: "",
                    border: {
                        top: {
                            color: "CCCCCC",
                            space: 1,
                            style: "single",
                            size: 6
                        }
                    },
                    spacing: { before: 480, after: 120 }
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Généré depuis Ressources Orthophonie",
                            color: "999999",
                            size: 20 // 10pt
                        })
                    ]
                })
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${list.name}.docx`);
};

// --- Print ---
export const printList = (list: SavedList) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert("Veuillez autoriser les pop-ups pour imprimer.");
        return;
    }

    const tagsHtml = list.tags && list.tags.length > 0
        ? list.tags.map(t => `<span class="tag">${t}</span>`).join('')
        : '<span class="text-gray">Sans étiquette</span>';

    const wordsHtml = list.words.map(word => `<li>${word.MOTS}</li>`).join('');

    const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${list.name}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            max-width: 800px;
            margin: 0 auto;
            color: #1a1a1a;
          }
          h1 { 
            margin-bottom: 8px; 
            font-size: 24px;
            color: #111;
          }
          .meta {
            margin-bottom: 24px;
          }
          .tags { 
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
          }
          .tag {
            background-color: #f3f4f6;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            color: #4b5563;
          }
          .text-gray {
             color: #9ca3af;
             font-size: 13px;
          }
          .count { 
            font-weight: 600;
            font-size: 14px;
            color: #374151;
          }
          hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 20px 0;
          }
          ul { 
            list-style-type: none; 
            padding-left: 0; 
          }
          li { 
            margin-bottom: 8px; 
            font-size: 16px;
            padding-left: 16px;
            position: relative;
          }
          li::before {
            content: "•";
            position: absolute;
            left: 0;
            color: #6b7280;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${list.name}</h1>
        <div class="meta">
            <div class="tags">${tagsHtml}</div>
            <div class="count">${list.words.length} mots</div>
        </div>
        
        <hr />

        <ul>
          ${wordsHtml}
        </ul>

        <div class="footer">
            Généré depuis Ressources Orthophonie
        </div>

        <script>
            window.onload = function() {
                window.print();
                // Optional: close after print interaction is done (mostly for UX)
                // window.onafterprint = function() { window.close(); }
            }
        </script>
      </body>
    </html>
  `;

    printWindow.document.write(content);
    printWindow.document.close();
};
