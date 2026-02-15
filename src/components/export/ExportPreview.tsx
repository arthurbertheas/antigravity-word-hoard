import { useMemo } from 'react';
import { Word } from '@/types/word';
import { ExportSettings, STATUS_COLORS, getWordExportStatus, ExportWordStatus } from '@/types/export';
import { WordStatus } from '@/contexts/PlayerContext';

interface ExportPreviewProps {
  words: Word[];
  settings: ExportSettings;
  wordStatuses?: Map<string, WordStatus>;
  currentIndex?: number;
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

function StatusBadge({ status }: { status: ExportWordStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold flex-shrink-0"
      style={{ backgroundColor: colors.bg, color: colors.text, border: `1.5px solid ${colors.border}` }}
    >
      {colors.symbol}
    </span>
  );
}

function SessionStats({ words, wordStatuses, currentIndex }: { words: Word[]; wordStatuses: Map<string, WordStatus>; currentIndex: number }) {
  const stats = useMemo(() => {
    let validated = 0, failed = 0, neutral = 0, notSeen = 0;
    words.forEach((word, index) => {
      const s = getWordExportStatus(word, index, wordStatuses, currentIndex);
      if (s === 'validated') validated++;
      else if (s === 'failed') failed++;
      else if (s === 'neutral') neutral++;
      else notSeen++;
    });
    const answered = validated + failed;
    const rate = answered > 0 ? Math.round((validated / answered) * 100) : 0;
    return { validated, failed, neutral, notSeen, rate };
  }, [words, wordStatuses, currentIndex]);

  const total = words.length;
  const barSegments = [
    { pct: (stats.validated / total) * 100, color: STATUS_COLORS.validated.border },
    { pct: (stats.failed / total) * 100, color: STATUS_COLORS.failed.border },
    { pct: (stats.neutral / total) * 100, color: STATUS_COLORS.neutral.border },
    { pct: (stats.notSeen / total) * 100, color: STATUS_COLORS['not-seen'].border },
  ];

  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Progress bar */}
      <div className="flex h-2 rounded-full overflow-hidden mb-3">
        {barSegments.map((seg, i) => (
          seg.pct > 0 && <div key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
        ))}
      </div>
      {/* Counters */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.validated.border }} />
          <span className="text-gray-600">{stats.validated} validé{stats.validated > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.failed.border }} />
          <span className="text-gray-600">{stats.failed} raté{stats.failed > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS.neutral.border }} />
          <span className="text-gray-600">{stats.neutral} non noté{stats.neutral > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS['not-seen'].border }} />
          <span className="text-gray-600">{stats.notSeen} pas vu{stats.notSeen > 1 ? 's' : ''}</span>
        </div>
      </div>
      {/* Success rate */}
      <div className="mt-2 pt-2 border-t border-gray-200 text-center">
        <span className="text-sm font-bold" style={{ color: STATUS_COLORS.validated.text }}>{stats.rate}%</span>
        <span className="text-[11px] text-gray-500 ml-1">de réussite</span>
      </div>
    </div>
  );
}

export function ExportPreview({ words, settings, wordStatuses, currentIndex }: ExportPreviewProps) {
  const isSessionMode = !!wordStatuses;

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
              {isSessionMode ? 'Résultats de session' : 'Mots à retravailler'} — {formatDate()}
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">{words.length} mots</p>
          </div>
        )}

        {/* Session Stats (only in session mode) */}
        {isSessionMode && wordStatuses && currentIndex !== undefined && (
          <SessionStats words={words} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}

        {/* Word List Preview */}
        <div className={
          settings.layout === 'grid-2col'
            ? 'grid grid-cols-2 gap-3'
            : settings.layout === 'grid-3col'
            ? 'grid grid-cols-3 gap-2.5'
            : 'space-y-3'
        }>
          {previewWords.map((word, index) => {
            const wordStatus = isSessionMode && wordStatuses && currentIndex !== undefined
              ? getWordExportStatus(word, index, wordStatuses, currentIndex)
              : null;
            const statusColors = wordStatus ? STATUS_COLORS[wordStatus] : null;

            return (
              <div
                key={`${word.MOTS}-${word.PHONEMES}`}
                className={
                  settings.layout === 'grid-2col' || settings.layout === 'grid-3col'
                    ? 'flex flex-col gap-2 p-3 bg-white border border-gray-200 rounded-lg'
                    : 'flex items-center gap-2.5'
                }
                style={statusColors ? { borderLeftColor: statusColors.border, borderLeftWidth: '3px' } : undefined}
              >
                {/* Status badge (session mode) */}
                {wordStatus && <StatusBadge status={wordStatus} />}

                {/* Number/Bullet (non-session mode) */}
                {!isSessionMode && (
                  <span className={
                    settings.layout === 'grid-2col' || settings.layout === 'grid-3col'
                      ? 'text-xs font-semibold text-[#6C5CE7]'
                      : 'text-sm font-semibold text-[#6C5CE7] mt-0.5'
                  }>
                    {settings.numberWords ? `${index + 1}.` : '•'}
                  </span>
                )}

                <div className="flex flex-col gap-1.5">
                  {/* Image */}
                  {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"] && (
                    <img
                      src={word["image associée"]}
                      alt={word.MOTS}
                      className={
                        settings.layout === 'grid-3col'
                          ? 'w-12 h-12 object-cover rounded border border-gray-200'
                          : 'w-16 h-16 object-cover rounded border border-gray-200'
                      }
                    />
                  )}

                  {/* Text content */}
                  <div>
                    {settings.display !== 'imageOnly' && (
                      <span className={
                        settings.layout === 'grid-3col'
                          ? 'text-xs text-gray-900 font-medium'
                          : 'text-sm text-gray-900'
                      }>
                        {word.MOTS}
                      </span>
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
            );
          })}
        </div>
        {words.length > PREVIEW_WORD_LIMIT && (
          <div className="text-xs text-gray-400 italic pt-2">
            ... et {words.length - previewWords.length} autres mots
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-gray-100 text-[11px] text-gray-400 italic text-center">
          Généré depuis Ressources Orthophonie
        </div>
      </div>
    </div>
  );
}
