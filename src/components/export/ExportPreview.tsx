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

const PREVIEW_WORD_LIMIT = 6;

const formatDate = () => {
  const today = new Date();
  return today.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

function StatusBadge({ status, small }: { status: ExportWordStatus; small?: boolean }) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold flex-shrink-0 ${small ? 'w-4 h-4 text-[8px]' : 'w-5 h-5 text-[10px]'}`}
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
    <div className="mb-4 p-3 bg-white rounded-lg border border-[#E2E8F0]">
      {/* Progress bar */}
      <div className="flex h-1.5 rounded-full overflow-hidden mb-2.5">
        {barSegments.map((seg, i) => (
          seg.pct > 0 && <div key={i} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
        ))}
      </div>
      {/* Counters */}
      <div className="flex items-center gap-3 text-[9px] flex-wrap">
        <span style={{ color: STATUS_COLORS.validated.text }}>{stats.validated} validés</span>
        <span className="text-[#94A3B8]">·</span>
        <span style={{ color: STATUS_COLORS.failed.text }}>{stats.failed} ratés</span>
        <span className="text-[#94A3B8]">·</span>
        <span style={{ color: STATUS_COLORS.neutral.text }}>{stats.neutral} non notés</span>
        <span className="text-[#94A3B8]">·</span>
        <span style={{ color: STATUS_COLORS['not-seen'].text }}>{stats.notSeen} pas vus</span>
      </div>
      <div className="mt-1.5 text-[10px] font-semibold" style={{ color: STATUS_COLORS.validated.text }}>
        {stats.rate}% de réussite
      </div>
    </div>
  );
}

/** Renders the word meta info (phoneme, category, syllable info) */
function WordMeta({ word, settings, small }: { word: Word; settings: ExportSettings; small?: boolean }) {
  const hasAny = (settings.includePhonemes && word.PHONEMES) ||
    (settings.includeCategories && word.SYNT) ||
    (settings.includeSyllableCount && word.NBSYLL) ||
    (settings.includeSyllableSegmentation && word["segmentation syllabique"]);
  if (!hasAny) return null;

  const fontSize = small ? 'text-[8px]' : 'text-[9px]';

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${small ? 'mt-0.5' : 'mt-1'}`}>
      {settings.includePhonemes && word.PHONEMES && (
        <span className={`${fontSize} text-[#6C5CE7] italic`}>/{word.PHONEMES}/</span>
      )}
      {settings.includeCategories && word.SYNT && (
        <span className={`${fontSize} text-[#718096] bg-[#EDF2F7] px-1 py-px rounded`}>{word.SYNT}</span>
      )}
      {settings.includeSyllableCount && word.NBSYLL && (
        <span className={`${fontSize} text-[#718096]`}>{word.NBSYLL} syll.</span>
      )}
      {settings.includeSyllableSegmentation && word["segmentation syllabique"] && (
        <span className={`${fontSize} text-[#10B981] font-mono`}>{word["segmentation syllabique"]}</span>
      )}
    </div>
  );
}

/** List 1-col layout */
function ListLayout({ words, settings, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; isSessionMode: boolean;
  wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {words.map((word, index) => {
        const wordStatus = isSessionMode && wordStatuses && currentIndex !== undefined
          ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
        const borderColor = wordStatus ? STATUS_COLORS[wordStatus].border : '#6C5CE7';

        return (
          <div key={`${word.MOTS}-${index}`}
            className="flex items-center gap-2 bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg p-2 relative overflow-hidden"
          >
            {/* Left accent border */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg" style={{ background: borderColor }} />

            <div className="pl-1.5 flex items-center gap-2 flex-1 min-w-0">
              {/* Status badge or number/bullet */}
              {wordStatus && <StatusBadge status={wordStatus} small />}
              {!isSessionMode && settings.numberWords && (
                <span className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white text-[9px] font-semibold flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </span>
              )}
              {!isSessionMode && !settings.numberWords && (
                <span className="text-[14px] text-[#6C5CE7] font-bold flex-shrink-0 leading-none">•</span>
              )}

              {/* Image */}
              {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"] && (
                <img src={word["image associée"]} alt={word.MOTS}
                  className="w-10 h-10 object-cover rounded border border-[#E2E8F0] flex-shrink-0" />
              )}

              {/* Text content */}
              {settings.display !== 'imageOnly' && (
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-[#1A202C] truncate">{word.MOTS}</div>
                  <WordMeta word={word} settings={settings} small />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Grid 2/3-col layout */
function GridLayout({ words, settings, cols, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; cols: 2 | 3; isSessionMode: boolean;
  wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  const is3col = cols === 3;
  return (
    <div className={`grid gap-2 ${is3col ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {words.map((word, index) => {
        const wordStatus = isSessionMode && wordStatuses && currentIndex !== undefined
          ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
        const borderColor = wordStatus ? STATUS_COLORS[wordStatus].border : '#6C5CE7';

        return (
          <div key={`${word.MOTS}-${index}`}
            className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg p-2 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: borderColor }} />
            <div className="pl-1.5">
              <div className="flex items-center gap-1.5 mb-1">
                {wordStatus && <StatusBadge status={wordStatus} small />}
                {!isSessionMode && settings.numberWords && (
                  <span className={`${is3col ? 'w-4 h-4 text-[7px]' : 'w-5 h-5 text-[8px]'} rounded-full bg-[#6C5CE7] text-white font-semibold flex items-center justify-center flex-shrink-0`}>
                    {index + 1}
                  </span>
                )}
                {!isSessionMode && !settings.numberWords && (
                  <span className="text-[12px] text-[#6C5CE7] font-bold leading-none">•</span>
                )}
              </div>

              {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"] && (
                <img src={word["image associée"]} alt={word.MOTS}
                  className={`${is3col ? 'w-8 h-8' : 'w-10 h-10'} object-cover rounded border border-[#E2E8F0] mb-1`} />
              )}

              {settings.display !== 'imageOnly' && (
                <>
                  <div className={`${is3col ? 'text-[10px]' : 'text-[11px]'} font-semibold text-[#1A202C] truncate`}>{word.MOTS}</div>
                  <WordMeta word={word} settings={settings} small={is3col} />
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Flashcards layout */
function FlashcardsLayout({ words, settings, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; isSessionMode: boolean;
  wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {words.map((word, index) => {
        const wordStatus = isSessionMode && wordStatuses && currentIndex !== undefined
          ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
        const topColor = wordStatus ? STATUS_COLORS[wordStatus].border : '#6C5CE7';

        return (
          <div key={`${word.MOTS}-${index}`}
            className="bg-[#FAFBFC] border border-[#E2E8F0] rounded-lg p-2 flex flex-col items-center gap-1.5 relative overflow-hidden"
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: topColor }} />

            {wordStatus && <StatusBadge status={wordStatus} small />}

            {settings.numberWords && (
              <span className="absolute top-2 left-2 w-4 h-4 rounded-full bg-[#6C5CE7] text-white text-[7px] font-semibold flex items-center justify-center">
                {index + 1}
              </span>
            )}

            {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && word["image associée"] && (
              <img src={word["image associée"]} alt={word.MOTS}
                className="w-full h-12 object-cover rounded border border-[#E2E8F0]" />
            )}

            {settings.display !== 'imageOnly' && (
              <div className="text-center">
                <div className="text-[10px] font-semibold text-[#1A202C]">{word.MOTS}</div>
                <WordMeta word={word} settings={settings} small />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Table layout */
function TableLayout({ words, settings, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; isSessionMode: boolean;
  wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  return (
    <table className="w-full text-[9px] border-collapse">
      <thead>
        <tr className="bg-[#FAFBFC] border-b-2 border-[#6C5CE7]">
          {isSessionMode && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Statut</th>}
          {settings.numberWords && <th className="text-center p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider w-6">#</th>}
          {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && (
            <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Image</th>
          )}
          {settings.display !== 'imageOnly' && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Mot</th>}
          {settings.includePhonemes && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Phonème</th>}
          {settings.includeCategories && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Cat.</th>}
          {settings.includeSyllableCount && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Syll.</th>}
          {settings.includeSyllableSegmentation && <th className="text-left p-1.5 font-semibold text-[#1A202C] uppercase text-[8px] tracking-wider">Seg.</th>}
        </tr>
      </thead>
      <tbody>
        {words.map((word, index) => {
          const wordStatus = isSessionMode && wordStatuses && currentIndex !== undefined
            ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
          return (
            <tr key={`${word.MOTS}-${index}`} className="border-b border-[#E2E8F0] hover:bg-[#FAFBFC]">
              {isSessionMode && wordStatus && (
                <td className="p-1.5 text-center"><StatusBadge status={wordStatus} small /></td>
              )}
              {settings.numberWords && (
                <td className="p-1.5 text-center font-semibold text-[#6C5CE7]">{index + 1}</td>
              )}
              {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && (
                <td className="p-1.5">
                  {word["image associée"] && (
                    <img src={word["image associée"]} alt={word.MOTS} className="w-6 h-6 object-cover rounded border border-[#E2E8F0]" />
                  )}
                </td>
              )}
              {settings.display !== 'imageOnly' && (
                <td className="p-1.5 font-semibold text-[#1A202C]">{word.MOTS}</td>
              )}
              {settings.includePhonemes && (
                <td className="p-1.5 text-[#6C5CE7] italic">{word.PHONEMES || ''}</td>
              )}
              {settings.includeCategories && (
                <td className="p-1.5"><span className="text-[#718096] bg-[#EDF2F7] px-1 py-px rounded text-[8px]">{word.SYNT || ''}</span></td>
              )}
              {settings.includeSyllableCount && (
                <td className="p-1.5 text-[#718096]">{word.NBSYLL || ''}</td>
              )}
              {settings.includeSyllableSegmentation && (
                <td className="p-1.5 text-[#10B981] font-mono">{word["segmentation syllabique"] || ''}</td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function ExportPreview({ words, settings, wordStatuses, currentIndex }: ExportPreviewProps) {
  const isSessionMode = !!wordStatuses;

  // Handle empty state
  if (words.length === 0) {
    return (
      <div className="flex-1 bg-white px-6 py-7 flex items-center justify-center">
        <div className="text-center text-[#9CA3AF]">
          <p className="text-[13.5px]">Aucun mot sélectionné</p>
          <p className="text-[12px] mt-2">Sélectionnez des mots pour voir l'aperçu</p>
        </div>
      </div>
    );
  }

  const previewWords = useMemo(() => {
    return words.slice(0, PREVIEW_WORD_LIMIT);
  }, [words]);

  const defaultTitle = isSessionMode ? 'Résultats de session' : 'Ma sélection de mots';

  return (
    <div className="flex-1 bg-white px-6 py-7 overflow-y-auto">
      {/* Preview Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13.5px] font-semibold text-[#1A1A2E]">
          Aperçu <span className="text-[12px] font-normal text-[#9CA3AF]">({words.length} mots)</span>
        </div>
        <div className="text-[11px] text-[#9CA3AF]">Format A4</div>
      </div>

      {/* Document Preview — mirrors the actual export output */}
      <div className="bg-[#F8F9FC] border border-[#F3F4F6] rounded-xl p-6 min-h-[400px]">

        {/* ═══ DOCUMENT HEADER (matches PDF/Print output) ═══ */}
        <div className="pb-3 mb-4" style={{ borderBottom: '2px solid #6C5CE7' }}>
          {/* Title */}
          <h3 className="text-[14px] font-bold text-[#1A202C] leading-tight mb-1">
            {settings.title || defaultTitle}
          </h3>

          {/* Subtitle */}
          {settings.subtitle && (
            <p className="text-[10px] text-[#6C5CE7] font-medium mb-1.5">{settings.subtitle}</p>
          )}

          {/* Meta line (date + word count) — matches PDF/Print meta format */}
          {(settings.includeDate || settings.includeWordCount) && (
            <div className="flex gap-4 text-[9px] text-[#718096]">
              {settings.includeDate && <span>📅 {formatDate()}</span>}
              {settings.includeWordCount && <span>🏷️ {words.length} mots sélectionnés</span>}
            </div>
          )}
        </div>

        {/* ═══ SESSION STATS ═══ */}
        {isSessionMode && wordStatuses && currentIndex !== undefined && (
          <SessionStats words={words} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}

        {/* ═══ WORD CONTENT (layout-specific) ═══ */}
        {settings.layout === 'list-1col' && (
          <ListLayout words={previewWords} settings={settings} isSessionMode={isSessionMode}
            wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {(settings.layout === 'grid-2col') && (
          <GridLayout words={previewWords} settings={settings} cols={2} isSessionMode={isSessionMode}
            wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {(settings.layout === 'grid-3col') && (
          <GridLayout words={previewWords} settings={settings} cols={3} isSessionMode={isSessionMode}
            wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {settings.layout === 'flashcards' && (
          <FlashcardsLayout words={previewWords} settings={settings} isSessionMode={isSessionMode}
            wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {settings.layout === 'table' && (
          <TableLayout words={previewWords} settings={settings} isSessionMode={isSessionMode}
            wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}

        {words.length > PREVIEW_WORD_LIMIT && (
          <div className="text-[10px] text-[#A0AEC0] italic pt-3">
            ... et {words.length - previewWords.length} autres mots
          </div>
        )}

        {/* ═══ FOOTER (matches PDF/Print footer) ═══ */}
        <div className="mt-5 pt-3 border-t border-[#E2E8F0] text-[9px] text-[#A0AEC0] italic text-center">
          Généré depuis La Boîte à mots
        </div>
      </div>
    </div>
  );
}
