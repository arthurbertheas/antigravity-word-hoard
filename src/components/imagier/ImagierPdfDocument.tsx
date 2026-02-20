import {
  Document, Page, View, Text, Image, Font, StyleSheet,
} from '@react-pdf/renderer';
import { Word } from '@/types/word';
import { ImagierSettings, getGridMax, getGridDimensions } from '@/types/imagier';
import { applyCasse, formatPhonemes, getDeterminer } from '@/utils/imagier-utils';

/* ─── Font registration ─── */

// Sora static weights from fontsource CDN (WOFF format, supported by react-pdf)
Font.register({
  family: 'Sora',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-400-normal.woff', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-700-normal.woff', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/sora@latest/latin-800-normal.woff', fontWeight: 800 },
  ],
});

// Disable hyphenation (French words shouldn't be hyphenated in the imagier)
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
    padding: 0, // overridden per-page with settings.margin * MM_TO_PT
    backgroundColor: '#FFFFFF',
    fontFamily: 'Sora',
    flexDirection: 'column',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: '#6C5CE7',
    borderBottomStyle: 'solid',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'column',
    gap: 2,
  },
  headerTitle: {
    fontFamily: 'Sora',
    fontSize: 18,
    fontWeight: 800,
    color: '#1A1A2E',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: 400,
  },
  headerCount: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: 500,
  },

  /* Grid */
  grid: {
    flex: 1,
    flexDirection: 'column',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },

  /* Card */
  card: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 6, // p-1.5
    overflow: 'hidden',
  },
  cardNormal: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'solid',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  cardCutting: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },

  /* Image */
  imageContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    overflow: 'hidden',
  },
  image: {
    objectFit: 'contain' as const,
    maxWidth: '100%',
    maxHeight: '100%',
  },

  /* Text zone */
  textZone: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    flexShrink: 0,
  },
  determiner: {
    fontSize: DET_FONT_SIZE,
    color: '#9CA3AF',
    fontWeight: 500,
  },
  word: {
    fontFamily: 'Sora',
    fontWeight: 700,
    color: '#1A1A2E',
    textAlign: 'center',
  },
  syllable: {
    fontSize: SYLL_FONT_SIZE,
    color: '#6B7280',
    fontWeight: 500,
    letterSpacing: 0.5,
    marginTop: 1,
  },
  phoneme: {
    fontSize: PHON_FONT_SIZE,
    color: '#6C5CE7',
    opacity: 0.8,
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  badge: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: 700,
    color: '#9CA3AF',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },

  /* Footer */
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    borderTopStyle: 'solid',
    flexShrink: 0,
  },
  footerText: {
    fontSize: 9,
    color: '#CBD5E1',
  },
  footerDot: {
    width: 4,
    height: 4,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: '#A29BFE',
    marginRight: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

/* ─── Card component ─── */

function PdfCard({ word, settings, imageMap }: { word: Word; settings: ImagierSettings; imageMap: Map<string, string> }) {
  const imageUrl = word['image associée']?.trim();
  const imageSrc = imageUrl ? imageMap.get(imageUrl) : undefined;
  const det = getDeterminer(word);
  const cardStyle = settings.cuttingGuides ? s.cardCutting : s.cardNormal;

  return (
    <View style={[s.card, cardStyle]}>
      {/* Image from pre-fetched base64 data URI */}
      {imageSrc && (
        <View style={s.imageContainer}>
          <Image src={imageSrc} style={s.image} />
        </View>
      )}

      {/* Text zone */}
      <View style={s.textZone}>
        {settings.showDeterminer && det ? (
          <Text style={s.determiner}>{det}</Text>
        ) : null}

        {settings.showWord && (
          <Text style={[s.word, { fontSize: FONT_SIZE[settings.fontSize] }]}>
            {applyCasse(word.MOTS, settings.casse)}
          </Text>
        )}

        {settings.showSyllBreak && word['segmentation syllabique'] && (
          <Text style={s.syllable}>
            {applyCasse(word['segmentation syllabique'], settings.casse)}
          </Text>
        )}

        {settings.showPhoneme && word.PHONEMES && (
          <Text style={s.phoneme}>
            {formatPhonemes(word.PHONEMES)}
          </Text>
        )}

        {(settings.showCategory || settings.showSyllCount) && (
          <View style={s.badgeRow}>
            {settings.showCategory && (
              <Text style={[s.badge, { textTransform: 'uppercase', letterSpacing: 0.5 }]}>
                {word.SYNT}
              </Text>
            )}
            {settings.showSyllCount && (
              <Text style={s.badge}>
                {word.NBSYLL} syll.
              </Text>
            )}
          </View>
        )}
      </View>
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
  const max = getGridMax(settings.grid);
  const { cols, rows } = getGridDimensions(settings.grid, settings.orientation);
  const totalPages = Math.max(1, Math.ceil(words.length / max));
  const hGap = settings.cuttingGuides ? 0 : settings.hGap * MM_TO_PT;
  const vGap = settings.cuttingGuides ? 0 : settings.vGap * MM_TO_PT;
  const pagePadding = settings.margin * MM_TO_PT;

  return (
    <Document title="Imagier phonétique" author="MaterielOrthophonie.fr">
      {Array.from({ length: totalPages }, (_, pageIndex) => {
        const start = pageIndex * max;
        const pageWords = words.slice(start, start + max);
        const rowChunks = chunkArray(pageWords, cols);

        // Pad last row with nulls for consistent layout
        if (rowChunks.length > 0) {
          const lastRow = rowChunks[rowChunks.length - 1];
          while (lastRow.length < cols) {
            lastRow.push(null as unknown as Word);
          }
        }
        // Pad missing rows for consistent row heights
        while (rowChunks.length < rows) {
          rowChunks.push(Array(cols).fill(null));
        }

        return (
          <Page
            key={pageIndex}
            size="A4"
            orientation={settings.orientation}
            style={[s.page, { padding: pagePadding }]}
          >
            {/* Header */}
            {settings.showHeader && (
              <View style={s.header}>
                <View style={s.headerLeft}>
                  {settings.title ? (
                    <Text style={s.headerTitle}>{settings.title}</Text>
                  ) : null}
                  {settings.subtitle ? (
                    <Text style={s.headerSubtitle}>{settings.subtitle}</Text>
                  ) : null}
                </View>
                <Text style={s.headerCount}>
                  {pageWords.filter(Boolean).length} mots
                </Text>
              </View>
            )}

            {/* Grid */}
            <View style={[s.grid, { gap: vGap }]}>
              {rowChunks.map((rowWords, rowIndex) => (
                <View key={rowIndex} style={[s.row, { gap: hGap }]}>
                  {rowWords.map((word, colIndex) => (
                    word ? (
                      <PdfCard
                        key={word.uid || word.MOTS + colIndex}
                        word={word}
                        settings={settings}
                        imageMap={imageMap}
                      />
                    ) : (
                      // Empty placeholder to keep grid alignment
                      <View key={`empty-${colIndex}`} style={{ flex: 1 }} />
                    )
                  ))}
                </View>
              ))}
            </View>

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
