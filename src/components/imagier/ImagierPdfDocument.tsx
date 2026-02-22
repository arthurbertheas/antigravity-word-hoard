import {
  Document, Page, View, Text, Image, Font, StyleSheet,
  Svg, Path as SvgPath,
} from '@react-pdf/renderer';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, getGridDimensions, getAutoGrid, snakePath } from '@/types/imagier';
import { applyCasse, formatPhonemes, getDeterminer } from '@/utils/imagier-utils';

/* ─── Font registration ─── */

Font.register({
  family: 'Sora',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-800-normal.woff', fontWeight: 800 },
  ],
});

Font.registerHyphenationCallback(word => [word]);

/* ─── Constants ─── */

const MM_TO_PT = 2.8346;

const FONT_SIZE: Record<string, number> = { small: 10, medium: 12, large: 15 };
const SYLL_FONT_SIZE = 10;
const PHON_FONT_SIZE = 9;
const DET_FONT_SIZE = 10;
const BADGE_FONT_SIZE = 7;

/* ─── Helpers ─── */

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/* ─── Styles ─── */

const s = StyleSheet.create({
  page: {
    padding: 0,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Sora',
    flexDirection: 'column',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: '#6C5CE7',
    borderBottomStyle: 'solid',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'column', gap: 2 },
  headerTitle: { fontFamily: 'Sora', fontSize: 18, fontWeight: 800, color: '#1A1A2E', letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 11, color: '#9CA3AF', fontWeight: 400 },
  headerCount: { fontSize: 11, color: '#9CA3AF', fontWeight: 500 },

  /* Grid layout */
  grid: { flex: 1, flexDirection: 'column' },
  row: { flex: 1, flexDirection: 'row' },

  /* Card base */
  card: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 6,
    overflow: 'hidden',
  },
  cardNormal: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'solid',
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
  },
  cardCutting: { borderWidth: 1, borderColor: '#CBD5E1', borderStyle: 'dashed' },

  /* Image */
  imageContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 4, overflow: 'hidden' },
  image: { objectFit: 'contain' as const, maxWidth: '100%', maxHeight: '100%' },

  /* Text zone */
  textZone: { flexDirection: 'column', alignItems: 'center', width: '100%', flexShrink: 0 },
  determiner: { fontSize: DET_FONT_SIZE, color: '#9CA3AF', fontWeight: 500 },
  word: { fontFamily: 'Sora', fontWeight: 700, color: '#1A1A2E', textAlign: 'center' },
  syllable: { fontSize: SYLL_FONT_SIZE, color: '#6B7280', fontWeight: 500, letterSpacing: 0.5, marginTop: 1 },
  phoneme: { fontSize: PHON_FONT_SIZE, color: '#6C5CE7', opacity: 0.8, marginTop: 1 },
  badgeRow: { flexDirection: 'row', gap: 4, marginTop: 2 },
  badge: {
    fontSize: BADGE_FONT_SIZE, fontWeight: 700, color: '#9CA3AF',
    backgroundColor: '#FAFBFC', paddingHorizontal: 4, paddingVertical: 1,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
  },

  /* Footer */
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingLeft: 10, paddingRight: 10,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9', borderTopStyle: 'solid', flexShrink: 0,
  },
  footerText: { fontSize: 9, color: '#CBD5E1' },
  footerDot: {
    width: 4, height: 4,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
    borderBottomLeftRadius: 2, borderBottomRightRadius: 2,
    backgroundColor: '#A29BFE', marginRight: 4,
  },
  footerRight: { flexDirection: 'row', alignItems: 'center' },
});

/* ─── Card text content (shared between grid and parcours) ─── */

function CardContent({ word, settings }: { word: Word; settings: ImagierSettings; imageMap: Map<string, string> }) {
  const det = getDeterminer(word);
  return (
    <View style={s.textZone}>
      {settings.showDeterminer && det ? <Text style={s.determiner}>{det}</Text> : null}
      {settings.showWord && (
        <Text style={[s.word, { fontSize: FONT_SIZE[settings.fontSize] }]}>
          {applyCasse(word.MOTS, settings.casse)}
        </Text>
      )}
      {settings.showSyllBreak && word['segmentation syllabique'] && (
        <Text style={s.syllable}>{applyCasse(word['segmentation syllabique'], settings.casse)}</Text>
      )}
      {settings.showPhoneme && word.PHONEMES && (
        <Text style={s.phoneme}>{formatPhonemes(word.PHONEMES)}</Text>
      )}
      {(settings.showCategory || settings.showSyllCount) && (
        <View style={s.badgeRow}>
          {settings.showCategory && (
            <Text style={[s.badge, { textTransform: 'uppercase', letterSpacing: 0.5 }]}>{word.SYNT}</Text>
          )}
          {settings.showSyllCount && <Text style={s.badge}>{word.NBSYLL} syll.</Text>}
        </View>
      )}
    </View>
  );
}

/* ─── Grid card ─── */

function PdfCard({ word, settings, imageMap }: { word: Word; settings: ImagierSettings; imageMap: Map<string, string> }) {
  const imageUrl = word['image associée']?.trim();
  const imageSrc = imageUrl ? imageMap.get(imageUrl) : undefined;
  const cardStyle = settings.cuttingGuides ? s.cardCutting : s.cardNormal;

  return (
    <View style={[s.card, cardStyle]}>
      {imageSrc && (
        <View style={s.imageContainer}>
          <Image src={imageSrc} style={s.image} />
        </View>
      )}
      <CardContent word={word} settings={settings} imageMap={imageMap} />
    </View>
  );
}

/* ─── Parcours card (absolute positioned, with number badge + DÉPART/ARRIVÉE) ─── */

function ParcoursCellPdf({
  word, settings, imageMap, number, isFirst, isLast,
}: {
  word: Word;
  settings: ImagierSettings;
  imageMap: Map<string, string>;
  number: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const imageUrl = word['image associée']?.trim();
  const imageSrc = imageUrl ? imageMap.get(imageUrl) : undefined;

  return (
    <View style={[s.card, s.cardNormal, { position: 'relative' }]}>
      {imageSrc && (
        <View style={s.imageContainer}>
          <Image src={imageSrc} style={s.image} />
        </View>
      )}
      <CardContent word={word} settings={settings} imageMap={imageMap} />

      {/* Number badge — top-left */}
      <View style={{
        position: 'absolute', top: 3, left: 3,
        width: 14, height: 14, borderRadius: 7,
        backgroundColor: '#6C5CE7',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 6, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Sora' }}>
          {number}
        </Text>
      </View>

      {/* DÉPART — bottom-left */}
      {isFirst && (
        <View style={{
          position: 'absolute', bottom: 3, left: 3,
          backgroundColor: '#10B981', borderRadius: 2,
          paddingHorizontal: 3, paddingVertical: 1,
        }}>
          <Text style={{ fontSize: 5.5, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Sora' }}>
            DÉPART
          </Text>
        </View>
      )}

      {/* ARRIVÉE — bottom-right */}
      {isLast && (
        <View style={{
          position: 'absolute', bottom: 3, right: 3,
          backgroundColor: '#F59E0B', borderRadius: 2,
          paddingHorizontal: 3, paddingVertical: 1,
        }}>
          <Text style={{ fontSize: 5.5, fontWeight: 800, color: '#FFFFFF', fontFamily: 'Sora' }}>
            ARRIVÉE !
          </Text>
        </View>
      )}
    </View>
  );
}

/* ─── Document component ─── */

interface ImagierPdfDocumentProps {
  words: Word[];
  settings: ImagierSettings;
  imageMap: Map<string, string>;
}

export function ImagierPdfDocument({ words, settings, imageMap }: ImagierPdfDocumentProps) {
  const isGrid = settings.pageStyle === 'grid';

  const max = isGrid ? getGridMax(settings.grid) : settings.parcoursPerPage;
  const totalPages = Math.max(1, Math.ceil(words.length / max));
  const pagePadding = settings.margin * MM_TO_PT;

  // Grid-specific
  const { cols: gridCols, rows: gridRows } = getGridDimensions(settings.grid, settings.orientation);
  const hGap = settings.cuttingGuides ? 0 : settings.hGap * MM_TO_PT;
  const vGap = settings.cuttingGuides ? 0 : settings.vGap * MM_TO_PT;

  return (
    <Document title="Imagier phonétique" author="MaterielOrthophonie.fr">
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const start = pageIndex * max;
        const pageWords = words.slice(start, start + max);

        return (
          <Page
            key={pageIndex}
            size="A4"
            orientation={settings.pageStyle === 'parcours-s' ? 'landscape' : settings.orientation}
            style={[s.page, { paddingTop: 10, paddingBottom: 8 }]}
          >
            {/* Header */}
            {settings.showHeader && (
              <View style={s.header}>
                <View style={s.headerLeft}>
                  {settings.title ? <Text style={s.headerTitle}>{settings.title}</Text> : null}
                  {settings.subtitle ? <Text style={s.headerSubtitle}>{settings.subtitle}</Text> : null}
                </View>
                <Text style={s.headerCount}>{pageWords.filter(Boolean).length} mots</Text>
              </View>
            )}

            {/* ── Grid layout ── */}
            {isGrid && (() => {
              const rowChunks = chunkArray(pageWords, gridCols);
              if (rowChunks.length > 0) {
                const lastRow = rowChunks[rowChunks.length - 1];
                while (lastRow.length < gridCols) lastRow.push(null as unknown as Word);
              }
              while (rowChunks.length < gridRows) rowChunks.push(Array(gridCols).fill(null));

              return (
                <View style={[s.grid, { gap: vGap, marginTop: pagePadding, marginBottom: pagePadding, marginLeft: pagePadding, marginRight: pagePadding }]}>
                  {rowChunks.map((rowWords, rowIndex) => (
                    <View key={rowIndex} style={[s.row, { gap: hGap }]}>
                      {rowWords.map((word, colIndex) => (
                        word ? (
                          <PdfCard key={word.uid || word.MOTS + colIndex} word={word} settings={settings} imageMap={imageMap} />
                        ) : (
                          <View key={`empty-${colIndex}`} style={{ flex: 1 }} />
                        )
                      ))}
                    </View>
                  ))}
                </View>
              );
            })()}

            {/* ── Parcours — snake board game with visible ribbon ── always landscape */}
            {settings.pageStyle === 'parcours-s' && (() => {
              const n = pageWords.length;
              if (n === 0) return null;

              const pdfPageW = 842;
              const pdfPageH = 595;
              const headerH = settings.showHeader ? 52 : 0;
              const footerH = 28;
              const pdfUsableW = pdfPageW - 2 * pagePadding;
              const pdfUsableH = pdfPageH - 10 - 8 - headerH - footerH;

              // Auto-compute grid from actual word count
              const { cols, rows } = getAutoGrid(n);
              const path = snakePath(cols, rows);

              // Account for vertical margin (horizontal margin already in pdfUsableW)
              const parcUsableH = pdfUsableH - 2 * pagePadding;

              // Square cards
              const availW = (pdfUsableW - (cols - 1) * hGap) / cols;
              const availH = (parcUsableH - (rows - 1) * vGap) / rows;
              const cardSize = Math.min(availW, availH);

              // Center the grid (with vertical margin offset)
              const gridW = cols * cardSize + (cols - 1) * hGap;
              const gridH = rows * cardSize + (rows - 1) * vGap;
              const offsetX = (pdfUsableW - gridW) / 2;
              const offsetY = pagePadding + (parcUsableH - gridH) / 2;

              // Card centers for ribbon
              const centers = [];
              for (let i = 0; i < n; i++) {
                const { col, row } = path[i];
                centers.push({
                  cx: offsetX + col * (cardSize + hGap) + cardSize / 2,
                  cy: offsetY + row * (cardSize + vGap) + cardSize / 2,
                });
              }
              const ribbonWidth = cardSize;
              const pathD = centers.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx} ${p.cy}`).join(' ');

              return (
                <View style={{ flex: 1, position: 'relative', marginLeft: pagePadding, marginRight: pagePadding }}>
                  {/* Ribbon path */}
                  {n > 1 && (
                    <Svg style={{ position: 'absolute', left: 0, top: 0 }} width={pdfUsableW} height={pdfUsableH}>
                      <SvgPath
                        d={pathD}
                        stroke="#A29BFE"
                        strokeWidth={ribbonWidth}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        fill="none"
                        opacity={0.22}
                      />
                    </Svg>
                  )}
                  {/* Cards on top */}
                  {pageWords.map((word, i) => {
                    const { col, row } = path[i];
                    const x = offsetX + col * (cardSize + hGap);
                    const y = offsetY + row * (cardSize + vGap);
                    return (
                      <View key={word.uid || word.MOTS + i}
                        style={{ position: 'absolute', left: x, top: y, width: cardSize, height: cardSize }}>
                        <ParcoursCellPdf
                          word={word} settings={settings} imageMap={imageMap}
                          number={start + i + 1} isFirst={start + i === 0} isLast={start + i === words.length - 1}
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* ── Circulaire layout ── */}
            {settings.pageStyle === 'circulaire' && (() => {
              const n = pageWords.length;
              const pageW = settings.orientation === 'portrait' ? 595 : 842;
              const pageH = settings.orientation === 'portrait' ? 842 : 595;
              const headerH = settings.showHeader ? 52 : 0;
              const footerH = 28;
              const usableW = pageW - 2 * pagePadding;
              const usableH = pageH - 10 - 8 - headerH - footerH;

              const cx = usableW / 2;
              const cy = usableH / 2;
              const R = Math.min(usableW, usableH) * 0.38;
              const cardSize = Math.min(R * 0.52, (2 * Math.PI * R) / Math.max(n, 1) * 0.82);

              return (
                <View style={{ flex: 1, position: 'relative', marginLeft: pagePadding, marginRight: pagePadding }}>
                  {pageWords.map((word, i) => {
                    const angle = (i / Math.max(n, 1)) * 2 * Math.PI - Math.PI / 2;
                    const x = cx + R * Math.cos(angle) - cardSize / 2;
                    const y = cy + R * Math.sin(angle) - cardSize / 2;
                    return (
                      <View key={word.uid || word.MOTS + i}
                        style={{ position: 'absolute', left: x, top: y, width: cardSize, height: cardSize }}>
                        <ParcoursCellPdf
                          word={word} settings={settings} imageMap={imageMap}
                          number={start + i + 1} isFirst={start + i === 0} isLast={start + i === words.length - 1}
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })()}

            {/* Footer */}
            <View style={s.footer}>
              <Text style={s.footerText}>Imagier phonétique</Text>
              <View style={s.footerRight}>
                <View style={s.footerDot} />
                <Text style={s.footerText}>MaterielOrthophonie.fr</Text>
              </View>
            </View>
          </Page>
        );
      })}
    </Document>
  );
}
