import { useState, useEffect, useCallback } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Download, X } from 'lucide-react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS, ExportPanelProps } from '@/types/export';
import { ExportOptions } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { exportToPDF, exportToWord, exportToPrint } from '@/lib/export-utils';
import { toast } from 'sonner';

export function ExportPanel({ selectedWords, onClose, wordStatuses, currentIndex }: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const isSessionMode = !!wordStatuses;

  const handleExport = useCallback(async () => {
    try {
      switch (settings.format) {
        case 'pdf':
          await exportToPDF(selectedWords, settings, wordStatuses, currentIndex);
          toast.success('PDF téléchargé avec succès !');
          break;
        case 'word':
          await exportToWord(selectedWords, settings, wordStatuses, currentIndex);
          toast.success('Document Word téléchargé avec succès !');
          break;
        case 'print':
          exportToPrint(selectedWords, settings, wordStatuses, currentIndex);
          toast.success('Fenêtre d\'impression ouverte');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export. Veuillez réessayer.');
    }
  }, [selectedWords, settings, wordStatuses, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleExport();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleExport]);

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200" />
        <Dialog.Content className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] max-w-4xl max-h-[90vh] bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] z-[101] animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] duration-300 focus:outline-none overflow-hidden font-dm-sans flex flex-col">

          {/* Header */}
          <div className="px-6 pt-6 pb-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7] shrink-0">
              <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-bold font-sora text-[#1A1A2E] mb-1">
                {isSessionMode ? 'Exporter les résultats' : 'Exporter la liste'}
              </Dialog.Title>
              <Dialog.Description className="text-[13.5px] text-[#6B7280] leading-relaxed">
                {isSessionMode
                  ? 'Personnalisez et exportez les résultats de cette session.'
                  : 'Personnalisez et exportez votre liste de mots.'}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors shrink-0">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body: Options + Preview */}
          <div className="flex-1 flex overflow-hidden min-h-0 border-t border-[#F3F4F6]">
            <ExportOptions settings={settings} onChange={setSettings} />
            <ExportPreview words={selectedWords} settings={settings} wordStatuses={wordStatuses} currentIndex={currentIndex} />
          </div>

          {/* Actions */}
          <div className="p-6 flex gap-3 justify-end items-center border-t border-[#F3F4F6]">
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-[10px] border border-gray-200 bg-white text-[#9CA3AF] font-medium text-[15px] hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-3 rounded-[10px] bg-[#6C5CE7] text-white font-semibold text-[15px] shadow-[0_3px_10px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Générer l'export
            </button>
          </div>

        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
