import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS, ExportPanelProps } from '@/types/export';
import { ExportOptions } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { Button } from '@/components/ui/button';
import { exportToPDF, exportToWord, exportToPrint } from '@/lib/export-utils';
import { toast } from 'sonner';

export function ExportPanel({ selectedWords, onClose }: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  const handleExport = useCallback(async () => {
    try {
      switch (settings.format) {
        case 'pdf':
          await exportToPDF(selectedWords, settings);
          toast.success('PDF téléchargé avec succès !');
          break;
        case 'word':
          await exportToWord(selectedWords, settings);
          toast.success('Document Word téléchargé avec succès !');
          break;
        case 'print':
          exportToPrint(selectedWords, settings);
          toast.success('Fenêtre d\'impression ouverte');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export. Veuillez réessayer.');
    }
  }, [selectedWords, settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === 'Escape') {
        onClose();
      }
      // Ctrl/Cmd + Enter to export
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleExport();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleExport]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">📥</span>
              <div className="text-base font-semibold text-gray-900">Exporter la liste</div>
            </div>
            <button
              onClick={onClose}
              className="flex-none w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all"
              title="Fermer"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Body: Options + Preview */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            <ExportOptions settings={settings} onChange={setSettings} />
            <ExportPreview words={selectedWords} settings={settings} />
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Annuler
            </button>
            <Button
              onClick={handleExport}
              className="px-6 py-3 bg-[#6C5CE7] hover:bg-[#5B4CD6] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Générer l'export
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
