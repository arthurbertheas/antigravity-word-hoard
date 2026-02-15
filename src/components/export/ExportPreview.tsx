import { useMemo } from 'react';
import { Word } from '@/types/word';
import { ExportSettings } from '@/types/export';

interface ExportPreviewProps {
  words: Word[];
  settings: ExportSettings;
}

const PREVIEW_WORD_LIMIT = 10;

const formatDate = () => {
  const today = new Date();
  return today.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export function ExportPreview({ words, settings }: ExportPreviewProps) {
  // Handle empty state
  if (words.length === 0) {
    return (
      <div className="flex-1 bg-white px-6 py-7 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-sm">Aucun mot sélectionné</p>
          <p className="text-xs mt-2">Sélectionnez des mots pour voir l'aperçu</p>
        </div>
      </div>
    );
  }

  const previewWords = useMemo(() => {
    return words.slice(0, PREVIEW_WORD_LIMIT);
  }, [words]);

  return (
    <div className="flex-1 bg-white px-6 py-7 overflow-y-auto">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-900">
          Aperçu <span className="text-xs font-normal text-gray-500">({words.length} mots)</span>
        </div>
        <div className="text-xs text-gray-400">Format A4</div>
      </div>

      {/* Document Preview */}
      <div className="bg-[#FAFBFC] border border-gray-200 rounded-lg p-7 min-h-[400px]">
        {/* Document Header */}
        {settings.includeDate && (
          <div className="pb-3 mb-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900">
              Mots à retravailler — {formatDate()}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">{words.length} mots</p>
          </div>
        )}

        {/* Word List Preview */}
        <div className="space-y-3">
          {previewWords.map((word, index) => (
            <div key={`${word.MOTS}-${word.PHONEMES}`} className="flex items-start gap-2.5">
              <span className="text-sm font-semibold text-[#6C5CE7] mt-0.5">
                {settings.numberWords ? `${index + 1}.` : '•'}
              </span>
              <div className="flex flex-col gap-1.5">
                {/* Image */}
                {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"] && (
                  <img
                    src={word["image associée"]}
                    alt={word.MOTS}
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                  />
                )}

                {/* Text content */}
                <div>
                  {settings.display !== 'imageOnly' && (
                    <span className="text-sm text-gray-900">{word.MOTS}</span>
                  )}
                  {settings.includePhonemes && word.PHONEMES && (
                    <span className="text-xs text-gray-500 ml-2">/{word.PHONEMES}/</span>
                  )}
                  {settings.includeCategories && word.SYNT && (
                    <span className="text-xs text-gray-500 ml-2">({word.SYNT})</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {words.length > PREVIEW_WORD_LIMIT && (
            <div className="text-xs text-gray-400 italic pt-2">
              ... et {words.length - previewWords.length} autres mots
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic text-center">
          Généré depuis Ressources Orthophonie
        </div>
      </div>
    </div>
  );
}
