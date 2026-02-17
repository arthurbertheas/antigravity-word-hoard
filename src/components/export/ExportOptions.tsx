import { ExportSettings, ExportDisplay, ExportLayout, ExportFormat } from '@/types/export';
import { FileText, FileImage, List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportOptionsProps {
  settings: ExportSettings;
  onChange: (settings: ExportSettings) => void;
}

export function ExportOptions({ settings, onChange }: ExportOptionsProps) {
  const updateSetting = <K extends keyof ExportSettings>(
    key: K,
    value: ExportSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-[340px] border-r border-[#F3F4F6] px-5 py-5 overflow-y-auto bg-[#F8F9FC] space-y-4">

      {/* Card 1: Contenu */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-4">
        <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Contenu</div>

        {/* Affichage */}
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium mb-2">Affichage</div>
          <select
            value={settings.display}
            onChange={(e) => updateSetting('display', e.target.value as ExportDisplay)}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#E5E7EB] rounded-lg font-medium text-[13px] text-[#1A1A2E] focus:border-[#6C5CE7] focus:outline-none bg-white transition-colors"
          >
            <option value="wordOnly">Mot seul</option>
            <option value="imageOnly">Image seule</option>
            <option value="wordAndImage">Mot + Image</option>
          </select>
        </div>

        {/* Séparateur */}
        <div className="border-t border-[#F3F4F6]" />

        {/* Mise en page */}
        <div>
          <div className="text-[11px] text-[#9CA3AF] font-medium mb-2">Mise en page</div>
          <select
            value={settings.layout}
            onChange={(e) => updateSetting('layout', e.target.value as ExportLayout)}
            className="w-full px-3 py-2.5 border-[1.5px] border-[#E5E7EB] rounded-lg font-medium text-[13px] text-[#1A1A2E] focus:border-[#6C5CE7] focus:outline-none bg-white transition-colors"
          >
            <option value="list-1col">Liste simple (1 colonne)</option>
            <option value="grid-2col">Grille 2 colonnes</option>
            <option value="grid-3col">Grille 3 colonnes</option>
          </select>
        </div>
      </div>

      {/* Card 2: Détails */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Détails</div>
        <div className="grid grid-cols-2 gap-x-1 gap-y-1">
          {[
            { key: 'includeDate' as const, label: 'Date' },
            { key: 'includePhonemes' as const, label: 'Phonèmes' },
            { key: 'numberWords' as const, label: 'Numéroter' },
            { key: 'includeCategories' as const, label: 'Catégories' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className={cn(
                'flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all',
                settings[key] ? 'bg-[#F0EDFF]' : 'hover:bg-[#F8F9FC]'
              )}
            >
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => updateSetting(key, e.target.checked)}
                className="sr-only"
              />
              <div
                className={cn(
                  'w-[16px] h-[16px] border-[2px] rounded-[4px] flex items-center justify-center transition-all shrink-0',
                  settings[key] ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white'
                )}
              >
                {settings[key] && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className={cn(
                'text-[12px] font-medium',
                settings[key] ? 'text-[#6C5CE7]' : 'text-[#6B7280]'
              )}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Card 3: Format */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
        <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">Format</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'pdf' as const, icon: FileText, color: '#EF4444', bgColor: '#FEF2F2', label: 'PDF' },
            { value: 'word' as const, icon: FileImage, color: '#3B82F6', bgColor: '#EFF6FF', label: 'Word' },
          ].map(({ value, icon: Icon, color, bgColor, label }) => (
            <label
              key={value}
              className={cn(
                'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg cursor-pointer transition-all',
                settings.format === value
                  ? 'bg-[#F0EDFF] ring-[1.5px] ring-[#6C5CE7]'
                  : 'hover:bg-[#F8F9FC]'
              )}
            >
              <input
                type="radio"
                name="format"
                value={value}
                checked={settings.format === value}
                onChange={(e) => updateSetting('format', e.target.value as ExportFormat)}
                className="sr-only"
              />
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: settings.format === value ? bgColor : '#F3F4F6' }}
              >
                <Icon className="w-4 h-4" style={{ color: settings.format === value ? color : '#9CA3AF' }} />
              </div>
              <span className={cn(
                'text-[11px] font-semibold',
                settings.format === value ? 'text-[#6C5CE7]' : 'text-[#9CA3AF]'
              )}>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
