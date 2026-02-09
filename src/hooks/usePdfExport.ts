import { useCallback } from 'react';
import jsPDF from 'jspdf';
import { Word } from '@/types/word';
import { WordStatus } from '@/contexts/PlayerContext';

interface UsePdfExportProps {
    queue: Word[];
    wordStatuses: Map<string, WordStatus>;
    startTime: number | null;
}

export function usePdfExport() {
    const generatePdf = useCallback(({ queue, wordStatuses, startTime }: UsePdfExportProps) => {
        const visualQueue = queue.filter(w => w.MOTS !== 'Bravo !');

        // Calculate stats
        const totalWords = visualQueue.length;
        const validatedCount = Array.from(wordStatuses.values()).filter(s => s === 'validated').length;
        const failedCount = Array.from(wordStatuses.values()).filter(s => s === 'failed').length;
        const answeredCount = validatedCount + failedCount;
        const successRate = answeredCount > 0 ? Math.round((validatedCount / answeredCount) * 100) : 0;
        const notSeenCount = totalWords - answeredCount;

        // Calculate duration
        const now = Date.now();
        const durationMs = startTime ? now - startTime : 0;
        const durationSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(durationSeconds / 60);
        const seconds = durationSeconds % 60;
        const durationText = `${minutes}m ${seconds}s`; // e.g. "2m 34s"

        // Format Date
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const mins = String(date.getMinutes()).padStart(2, '0');
        const dateStr = `${day}/${month}/${year} à ${hours}h${mins}`;

        // Create PDF
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('ANTIGRAVITY WORD HOARD', 105, 20, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Session de lecture orthophonique', 105, 28, { align: 'center' });

        // Info block
        doc.setFontSize(10);
        doc.text(`Date : ${dateStr}`, 20, 45);
        doc.text(`Durée : ${durationText}`, 20, 52);

        // Results block
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('RÉSULTATS :', 20, 65);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• Mots présentés : ${totalWords}`, 20, 75);
        doc.text(`• Réussis : ${validatedCount}`, 20, 82);
        doc.text(`• Ratés : ${failedCount}`, 20, 89);
        doc.text(`• Non vus : ${notSeenCount}`, 20, 96);
        doc.text(`• Taux de réussite : ${successRate}%`, 20, 103);

        // Word List
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('DÉTAIL PAR MOT :', 20, 120);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        let yPos = 130;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;

        visualQueue.forEach((word, index) => {
            if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
            }

            const status = word.uid ? wordStatuses.get(word.uid) || 'neutral' : 'neutral';
            const symbol = status === 'validated' ? '✓' : status === 'failed' ? '✗' : '—';

            // Highlight validation
            if (status === 'validated') {
                doc.setTextColor(0, 100, 0); // Greenish
            } else if (status === 'failed') {
                doc.setTextColor(200, 0, 0); // Reddish
            } else {
                doc.setTextColor(100, 100, 100); // Gray
            }

            doc.text(`${symbol} ${String(index + 1).padStart(2, '0')}. ${word.MOTS}`, 20, yPos);
            doc.setTextColor(0, 0, 0); // Reset color

            yPos += lineHeight;
        });

        // Save
        const fileName = `Liste_${totalWords}mots_${day}-${month}-${year}_${hours}h${mins}.pdf`;
        doc.save(fileName);

        return fileName;
    }, []);

    return { generatePdf };
}
