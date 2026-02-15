import { useState } from 'react';
import { ArrowLeft, Download } from 'lucide-react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS, ExportPanelProps } from '@/types/export';
import { ExportOptions } from './ExportOptions';
import { ExportPreview } from './ExportPreview';
import { Button } from '@/components/ui/button';

export function ExportPanel({ selectedWords, onClose }: ExportPanelProps) {
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  const handleExport = () => {
    // TODO: Implement actual export logic
    console.log('Exporting with settings:', settings);
  };

  return (
    <aside className="shrink-0 bg-white flex flex-col h-full border-l border-gray-200 w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-2.5">
        <button
          onClick={onClose}
          className="flex-none w-9 h-9 rounded-lg border-[1.5px] border-gray-300 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition-all"
          title="Retour"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <div className="flex items-center gap-2.5">
          <span className="text-lg">📥</span>
          <div className="text-base font-semibold text-gray-900">Exporter la liste</div>
        </div>
      </div>

      {/* Body: Options + Preview */}
      <div className="flex-1 flex overflow-hidden">
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
    </aside>
  );
}
