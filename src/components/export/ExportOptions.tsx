import { ExportSettings, ExportDisplay, ExportLayout, ExportFormat } from '@/types/export';
import { FileText, FileImage, Printer } from 'lucide-react';

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
    <div className="w-[340px] border-r border-gray-200 px-5 py-6 overflow-y-auto bg-[#FAFBFC]">

      {/* Affichage Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Affichage <span className="text-red-500">*</span>
        </label>
        <div className="space-y-1.5">
          {(['wordOnly', 'imageOnly', 'wordAndImage'] as const).map((option) => (
            <label
              key={option}
              className={`flex items-center gap-2.5 px-3 py-2.5 border-[1.5px] rounded-lg cursor-pointer transition-all ${
                settings.display === option
                  ? 'border-[#6C5CE7] bg-white'
                  : 'border-gray-200 bg-white hover:border-[#C4B8FF]'
              }`}
            >
              <input
                type="radio"
                name="display"
                value={option}
                checked={settings.display === option}
                onChange={(e) => updateSetting('display', e.target.value as ExportDisplay)}
                className="sr-only"
                role="radio"
                aria-checked={settings.display === option}
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  settings.display === option
                    ? 'border-[#6C5CE7]'
                    : 'border-gray-300'
                }`}
              >
                {settings.display === option && (
                  <div className="w-2 h-2 rounded-full bg-[#6C5CE7]" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {option === 'wordOnly' && 'Mot seul'}
                {option === 'imageOnly' && 'Image seule'}
                {option === 'wordAndImage' && 'Mot + Image'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Mise en page Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Mise en page <span className="text-red-500">*</span>
        </label>
        <select
          value={settings.layout}
          onChange={(e) => updateSetting('layout', e.target.value as ExportLayout)}
          className="w-full px-3 py-2.5 border-[1.5px] border-gray-200 rounded-lg font-medium text-sm text-gray-700 focus:border-[#6C5CE7] focus:outline-none bg-white"
        >
          <option value="list-1col">Liste simple (1 colonne)</option>
          <option value="grid-2col">Grille 2 colonnes</option>
          <option value="grid-3col">Grille 3 colonnes</option>
        </select>
      </div>

      {/* Options Section */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Options <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
          {[
            { key: 'includeDate' as const, label: 'Inclure la date' },
            { key: 'includePhonemes' as const, label: 'Inclure les phonèmes' },
            { key: 'numberWords' as const, label: 'Numéroter les mots' },
            { key: 'includeCategories' as const, label: 'Inclure les catégories' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => updateSetting(key, e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 border-[1.5px] rounded flex items-center justify-center ${
                  settings[key] ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-gray-300 bg-white'
                }`}
              >
                {settings[key] && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 12 10"
                    fill="none"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Format Section */}
      <div>
        <label className="text-xs font-semibold text-gray-900 mb-2.5 block">
          Format <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'pdf' as const, icon: FileText, color: 'text-red-500', label: 'PDF' },
            { value: 'word' as const, icon: FileImage, color: 'text-blue-500', label: 'Word' },
            { value: 'print' as const, icon: Printer, color: 'text-green-500', label: 'Imprimer' },
          ].map(({ value, icon: Icon, color, label }) => (
            <label
              key={value}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 border-[1.5px] rounded-lg cursor-pointer transition-all ${
                settings.format === value
                  ? 'border-[#6C5CE7] bg-[#F7F6FE]'
                  : 'border-gray-200 bg-white hover:border-[#C4B8FF]'
              }`}
            >
              <input
                type="radio"
                name="format"
                value={value}
                checked={settings.format === value}
                onChange={(e) => updateSetting('format', e.target.value as ExportFormat)}
                className="sr-only"
                role="radio"
                aria-checked={settings.format === value}
              />
              <Icon className={`w-6 h-6 ${color}`} />
              <span className="text-[11px] font-medium text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
