import {
  Document, Page, View, Text, Image, Font, StyleSheet,
} from '@react-pdf/renderer';
import { Word } from '@/types/word';
import { ExportSettings, STATUS_COLORS, getWordExportStatus, ExportWordStatus } from '@/types/export';
import { WordStatus } from '@/contexts/PlayerContext';

/* ─── Font registration (same as imagier) ─── */

Font.register({
  family: 'Sora',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-800-normal.woff', fontWeight: 800 },
  ],
});

Font.registerHyphenationCallback(word => [word]);

/* ─── Helpers ─── */

const br = (r: number) => ({
  borderTopLeftRadius: r,
  borderTopRightRadius: r,
  borderBottomLeftRadius: r,
  borderBottomRightRadius: r,
});

/* ─── Colors ─── */

const C = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  textDark: '#1A202C',
  textGray: '#718096',
  textMuted: '#A0AEC0',
  border: '#E2E8F0',
  bgCard: '#FAFBFC',
  green: '#10B981',
  greenText: '#059669',
  redText: '#DC2626',
  neutralText: '#64748B',
  notSeenText: '#CBD5E1',
};

/* ─── Styles ─── */

const s = StyleSheet.create({
  page: {
    padding: 28,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Sora',
    flexDirection: 'column',
  },

  /* Header */
  header: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    borderBottomStyle: 'solid',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: C.textDark,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: 400,
    color: C.primary,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 9,
    color: C.textGray,
  },

  /* Footer */
  footer: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: 'solid',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: C.textMuted,
    fontStyle: 'italic',
  },

  /* Session stats */
  statsBox: {
    marginBottom: 14,
    padding: 12,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    ...br(6),
  },
  progressBar: {
    flexDirection: 'row',
    height: 5,
    ...br(3),
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#F1F5F9',
  },
  statsCounters: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 8,
  },
  statsSeparator: {
    fontSize: 8,
    color: '#94A3B8',
  },
  successRate: {
    fontSize: 9,
    fontWeight: 700,
    color: C.greenText,
  },

  /* List layout — card uses borderLeft for accent */
  listContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    ...br(6),
    padding: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },

  /* Grid layout */
  gridCard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    ...br(6),
    padding: 8,
    paddingLeft: 12,
    borderLeftWidth: 3,
  },

  /* Flashcard layout */
  flashcard: {
    flex: 1,
    backgroundColor: C.bgCard,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: 'solid',
    ...br(6),
    padding: 6,
    alignItems: 'center',
    borderTopWidth: 3,
  },

  /* Table layout */
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: C.bgCard,
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    borderBottomStyle: 'solid',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: C.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    borderBottomStyle: 'solid',
    paddingVertical: 5,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  tableRowAlt: {
    backgroundColor: '#FCFCFD',
  },
  tableCell: {
    fontSize: 8,
    color: C.textDark,
  },

  /* Shared */
  statusBadge: {
    width: 16,
    height: 16,
    ...br(8),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'solid',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: 700,
  },
  numberBadge: {
    width: 16,
    height: 16,
    ...br(8),
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 7,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  bullet: {
    fontSize: 12,
    fontWeight: 700,
    color: C.primary,
    lineHeight: 1,
  },
  wordImage: {
    width: 32,
    height: 32,
    ...br(4),
    borderWidth: 0.5,
    borderColor: C.border,
    borderStyle: 'solid',
    objectFit: 'contain' as const,
  },
  wordText: {
    fontWeight: 700,
    color: C.textDark,
  },
  phonemeText: {
    fontStyle: 'italic',
    color: C.primary,
  },
  categoryBadge: {
    fontSize: 7,
    color: C.textGray,
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    ...br(4),
  },
  syllableText: {
    color: C.textGray,
  },
  segmentationText: {
    color: C.green,
  },
});

/* ─── Props ─── */

interface ExportPdfDocumentProps {
  words: Word[];
  settings: ExportSettings;
  imageMap: Map<string, string>;
  wordStatuses?: Map<string, WordStatus>;
  currentIndex?: number;
}

/* ─── Helper Components ─── */

function StatusBadge({ status }: { status: ExportWordStatus }) {
  const colors = STATUS_COLORS[status];
  return (
    <View style={[s.statusBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[s.statusBadgeText, { color: colors.text }]}>{colors.symbol}</Text>
    </View>
  );
}

function NumberBadge({ n }: { n: number }) {
  return (
    <View style={s.numberBadge}>
      <Text style={s.numberBadgeText}>{n}</Text>
    </View>
  );
}

function WordMeta({ word, settings, fontSize = 8 }: { word: Word; settings: ExportSettings; fontSize?: number }) {
  const parts: React.ReactNode[] = [];
  if (settings.includePhonemes && word.PHONEMES) {
    parts.push(<Text key="ph" style={[s.phonemeText, { fontSize }]}>/{word.PHONEMES}/</Text>);
  }
  if (settings.includeCategories && word.SYNT) {
    parts.push(<Text key="cat" style={[s.categoryBadge, { fontSize: fontSize - 1 }]}>{word.SYNT}</Text>);
  }
  if (settings.includeSyllableCount && word.NBSYLL) {
    parts.push(<Text key="sc" style={[s.syllableText, { fontSize }]}>{word.NBSYLL} syll.</Text>);
  }
  if (settings.includeSyllableSegmentation && word["segmentation syllabique"]) {
    parts.push(<Text key="ss" style={[s.segmentationText, { fontSize }]}>{word["segmentation syllabique"]}</Text>);
  }
  if (parts.length === 0) return null;
  return <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>{parts}</View>;
}

function WordImage({ word, imageMap, size = 32 }: { word: Word; imageMap: Map<string, string>; size?: number }) {
  const url = word['image associée']?.trim();
  const src = url ? imageMap.get(url) : undefined;
  if (!src) return null;
  return <Image src={src} style={[s.wordImage, { width: size, height: size }]} />;
}

/* ─── Header ─── */

function PdfHeader({ words, settings, isSessionMode }: { words: Word[]; settings: ExportSettings; isSessionMode: boolean }) {
  const defaultTitle = isSessionMode ? 'Résultats de session' : 'Ma sélection de mots';
  const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <View style={s.header}>
      <Text style={s.title}>{settings.title || defaultTitle}</Text>
      {settings.subtitle ? <Text style={s.subtitle}>{settings.subtitle}</Text> : null}
      {(settings.includeDate || settings.includeWordCount) && (
        <View style={s.metaRow}>
          {settings.includeDate && <Text style={s.metaText}>{today}</Text>}
          {settings.includeDate && settings.includeWordCount && <Text style={s.metaText}>·</Text>}
          {settings.includeWordCount && <Text style={s.metaText}>{words.length} mots sélectionnés</Text>}
        </View>
      )}
    </View>
  );
}

/* ─── Session Stats ─── */

function SessionStats({ words, wordStatuses, currentIndex }: { words: Word[]; wordStatuses: Map<string, WordStatus>; currentIndex: number }) {
  let validated = 0, failed = 0, neutral = 0, notSeen = 0;
  words.forEach((word, index) => {
    const st = getWordExportStatus(word, index, wordStatuses, currentIndex);
    if (st === 'validated') validated++;
    else if (st === 'failed') failed++;
    else if (st === 'neutral') neutral++;
    else notSeen++;
  });
  const total = words.length;
  const answered = validated + failed;
  const rate = answered > 0 ? Math.round((validated / answered) * 100) : 0;

  return (
    <View style={s.statsBox}>
      <View style={s.progressBar}>
        {validated > 0 && <View style={{ width: `${(validated / total) * 100}%`, backgroundColor: STATUS_COLORS.validated.border }} />}
        {failed > 0 && <View style={{ width: `${(failed / total) * 100}%`, backgroundColor: STATUS_COLORS.failed.border }} />}
        {neutral > 0 && <View style={{ width: `${(neutral / total) * 100}%`, backgroundColor: STATUS_COLORS.neutral.border }} />}
        {notSeen > 0 && <View style={{ width: `${(notSeen / total) * 100}%`, backgroundColor: STATUS_COLORS['not-seen'].border }} />}
      </View>
      <View style={s.statsCounters}>
        <Text style={[s.statsLabel, { color: C.greenText }]}>{validated} validés</Text>
        <Text style={s.statsSeparator}>·</Text>
        <Text style={[s.statsLabel, { color: C.redText }]}>{failed} ratés</Text>
        <Text style={s.statsSeparator}>·</Text>
        <Text style={[s.statsLabel, { color: C.neutralText }]}>{neutral} non notés</Text>
        <Text style={s.statsSeparator}>·</Text>
        <Text style={[s.statsLabel, { color: C.notSeenText }]}>{notSeen} pas vus</Text>
      </View>
      <Text style={s.successRate}>{rate}% de réussite</Text>
    </View>
  );
}

/* ─── Layout: List 1-col ─── */

function ListLayout({ words, settings, imageMap, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; imageMap: Map<string, string>;
  isSessionMode: boolean; wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';

  return (
    <View style={s.listContainer}>
      {words.map((word, index) => {
        const status = isSessionMode && wordStatuses && currentIndex !== undefined
          ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
        const accentColor = status ? STATUS_COLORS[status].border : C.primary;

        return (
          <View key={`${word.MOTS}-${index}`} style={[s.listCard, { borderLeftColor: accentColor }]} wrap={false}>
            {status && <StatusBadge status={status} />}
            {!isSessionMode && settings.numberWords && <NumberBadge n={index + 1} />}
            {!isSessionMode && !settings.numberWords && <Text style={s.bullet}>•</Text>}
            {hasImages && <WordImage word={word} imageMap={imageMap} size={32} />}
            {settings.display !== 'imageOnly' && (
              <View style={{ flex: 1 }}>
                <Text style={[s.wordText, { fontSize: 11 }]}>{word.MOTS}</Text>
                <WordMeta word={word} settings={settings} fontSize={8} />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* ─── Layout: Grid 2/3-col ─── */

function GridLayout({ words, settings, imageMap, cols, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; imageMap: Map<string, string>; cols: 2 | 3;
  isSessionMode: boolean; wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
  const is3 = cols === 3;
  const rows: Word[][] = [];
  for (let i = 0; i < words.length; i += cols) {
    rows.push(words.slice(i, i + cols));
  }

  return (
    <View style={{ flexDirection: 'column', gap: 6 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 6 }} wrap={false}>
          {row.map((word, ci) => {
            const index = ri * cols + ci;
            const status = isSessionMode && wordStatuses && currentIndex !== undefined
              ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
            const accentColor = status ? STATUS_COLORS[status].border : C.primary;

            return (
              <View key={`${word.MOTS}-${index}`} style={[s.gridCard, { borderLeftColor: accentColor }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                  {status && <StatusBadge status={status} />}
                  {!isSessionMode && settings.numberWords && <NumberBadge n={index + 1} />}
                  {!isSessionMode && !settings.numberWords && <Text style={s.bullet}>•</Text>}
                </View>
                {hasImages && <WordImage word={word} imageMap={imageMap} size={is3 ? 24 : 32} />}
                {settings.display !== 'imageOnly' && (
                  <View>
                    <Text style={[s.wordText, { fontSize: is3 ? 9 : 10 }]}>{word.MOTS}</Text>
                    <WordMeta word={word} settings={settings} fontSize={is3 ? 7 : 8} />
                  </View>
                )}
              </View>
            );
          })}
          {/* Pad row if incomplete */}
          {row.length < cols && Array.from({ length: cols - row.length }).map((_, i) => (
            <View key={`empty-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/* ─── Layout: Flashcards (4-col) ─── */

function FlashcardsLayout({ words, settings, imageMap, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; imageMap: Map<string, string>;
  isSessionMode: boolean; wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
  const cols = 4;
  const rows: Word[][] = [];
  for (let i = 0; i < words.length; i += cols) {
    rows.push(words.slice(i, i + cols));
  }

  return (
    <View style={{ flexDirection: 'column', gap: 6 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 6 }} wrap={false}>
          {row.map((word, ci) => {
            const index = ri * cols + ci;
            const status = isSessionMode && wordStatuses && currentIndex !== undefined
              ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;
            const topColor = status ? STATUS_COLORS[status].border : C.primary;

            return (
              <View key={`${word.MOTS}-${index}`} style={[s.flashcard, { borderTopColor: topColor }]}>
                {status && <StatusBadge status={status} />}
                {hasImages && (
                  <View style={{ marginTop: 4, marginBottom: 4 }}>
                    <WordImage word={word} imageMap={imageMap} size={40} />
                  </View>
                )}
                {settings.display !== 'imageOnly' && (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[s.wordText, { fontSize: 9, textAlign: 'center' }]}>{word.MOTS}</Text>
                    <WordMeta word={word} settings={settings} fontSize={7} />
                  </View>
                )}
              </View>
            );
          })}
          {row.length < cols && Array.from({ length: cols - row.length }).map((_, i) => (
            <View key={`empty-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/* ─── Layout: Table ─── */

function TableLayout({ words, settings, imageMap, isSessionMode, wordStatuses, currentIndex }: {
  words: Word[]; settings: ExportSettings; imageMap: Map<string, string>;
  isSessionMode: boolean; wordStatuses?: Map<string, WordStatus>; currentIndex?: number;
}) {
  const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';

  // Column definitions
  const cols: { key: string; label: string; flex: number }[] = [];
  if (isSessionMode) cols.push({ key: 'status', label: 'Statut', flex: 0.6 });
  if (settings.numberWords) cols.push({ key: 'number', label: '#', flex: 0.4 });
  if (hasImages) cols.push({ key: 'image', label: 'Image', flex: 0.8 });
  if (settings.display !== 'imageOnly') cols.push({ key: 'word', label: 'Mot', flex: 2 });
  if (settings.includePhonemes) cols.push({ key: 'phoneme', label: 'Phonème', flex: 1.5 });
  if (settings.includeCategories) cols.push({ key: 'category', label: 'Cat.', flex: 0.6 });
  if (settings.includeSyllableCount) cols.push({ key: 'syllCount', label: 'Syll.', flex: 0.5 });
  if (settings.includeSyllableSegmentation) cols.push({ key: 'syllSeg', label: 'Seg.', flex: 1 });

  return (
    <View>
      {/* Header */}
      <View style={s.tableHeader}>
        {cols.map(col => (
          <View key={col.key} style={{ flex: col.flex }}>
            <Text style={s.tableHeaderCell}>{col.label}</Text>
          </View>
        ))}
      </View>

      {/* Rows */}
      {words.map((word, index) => {
        const status = isSessionMode && wordStatuses && currentIndex !== undefined
          ? getWordExportStatus(word, index, wordStatuses, currentIndex) : null;

        return (
          <View key={`${word.MOTS}-${index}`} style={[s.tableRow, index % 2 === 0 ? s.tableRowAlt : {}]} wrap={false}>
            {cols.map(col => (
              <View key={col.key} style={{ flex: col.flex, justifyContent: 'center' }}>
                {col.key === 'status' && status && <StatusBadge status={status} />}
                {col.key === 'number' && <Text style={[s.tableCell, { fontWeight: 700, color: C.primary }]}>{index + 1}</Text>}
                {col.key === 'image' && <WordImage word={word} imageMap={imageMap} size={24} />}
                {col.key === 'word' && <Text style={[s.tableCell, { fontWeight: 700 }]}>{word.MOTS}</Text>}
                {col.key === 'phoneme' && <Text style={[s.tableCell, s.phonemeText, { fontSize: 8 }]}>/{word.PHONEMES || ''}/</Text>}
                {col.key === 'category' && <Text style={[s.categoryBadge]}>{word.SYNT || ''}</Text>}
                {col.key === 'syllCount' && <Text style={[s.tableCell, { color: C.textGray }]}>{word.NBSYLL || ''}</Text>}
                {col.key === 'syllSeg' && <Text style={[s.tableCell, { color: C.green }]}>{word["segmentation syllabique"] || ''}</Text>}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

/* ─── Main Document ─── */

export function ExportPdfDocument({ words, settings, imageMap, wordStatuses, currentIndex }: ExportPdfDocumentProps) {
  const isSessionMode = !!wordStatuses;

  return (
    <Document title={settings.title || 'Export mots'} author="La Boîte à mots">
      <Page size="A4" style={s.page}>
        {/* Header */}
        <PdfHeader words={words} settings={settings} isSessionMode={isSessionMode} />

        {/* Session stats */}
        {isSessionMode && wordStatuses && currentIndex !== undefined && (
          <SessionStats words={words} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}

        {/* Content */}
        {settings.layout === 'list-1col' && (
          <ListLayout words={words} settings={settings} imageMap={imageMap}
            isSessionMode={isSessionMode} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {(settings.layout === 'grid-2col') && (
          <GridLayout words={words} settings={settings} imageMap={imageMap} cols={2}
            isSessionMode={isSessionMode} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {(settings.layout === 'grid-3col') && (
          <GridLayout words={words} settings={settings} imageMap={imageMap} cols={3}
            isSessionMode={isSessionMode} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {settings.layout === 'flashcards' && (
          <FlashcardsLayout words={words} settings={settings} imageMap={imageMap}
            isSessionMode={isSessionMode} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}
        {settings.layout === 'table' && (
          <TableLayout words={words} settings={settings} imageMap={imageMap}
            isSessionMode={isSessionMode} wordStatuses={wordStatuses} currentIndex={currentIndex} />
        )}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>Généré depuis La Boîte à mots</Text>
        </View>
      </Page>
    </Document>
  );
}
