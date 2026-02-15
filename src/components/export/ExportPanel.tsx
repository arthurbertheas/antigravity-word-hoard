import { useState, useEffect, useCallback } from 'react';
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
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleExport();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleExport]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto animate-in zoom-in-95 fade-in duration-300 overflow-hidden font-dm-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#F3F4F6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7] shrink-0">
                <Download className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </div>
              <h2 className="text-base font-bold font-sora text-[#1A1A2E]">
                {isSessionMode ? 'Exporter les résultats' : 'Exporter la liste'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-[#9CA3AF] hover:text-[#1A1A2E] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Body: Options + Preview */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <ExportOptions settings={settings} onChange={setSettings} />
            <ExportPreview words={selectedWords} settings={settings} wordStatuses={wordStatuses} currentIndex={currentIndex} />
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-[#F3F4F6] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-[10px] border border-gray-200 bg-white text-[#9CA3AF] font-medium text-[15px] hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleExport}
              className="px-6 py-3 rounded-[10px] bg-[#6C5CE7] text-white font-semibold text-[15px] shadow-[0_3px_10px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Générer l'export
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
