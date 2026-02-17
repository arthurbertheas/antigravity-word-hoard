import { useState, useEffect, useCallback } from 'react';
import { Download, X, FileText } from 'lucide-react';
import { ExportSettings, DEFAULT_EXPORT_SETTINGS, ExportPanelProps, ExportFormat, ExportDisplay, ExportLayout } from '@/types/export';
import { ExportPreview } from './ExportPreview';
import { exportToWord } from '@/lib/export-utils';
import { ExportPdfDocument } from './ExportPdfDocument';
import { pdf } from '@react-pdf/renderer';
import { loadImageAsBase64ForImagier } from '@/utils/imagier-image-utils';
import { toast } from 'sonner';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PanelTabs, PanelTabsList, PanelTabsTrigger, PanelTabsContent } from '@/components/ui/PanelTabs';
import { cn } from '@/lib/utils';

const FORMAT_OPTIONS: { value: ExportFormat; label: string; ctaLabel: string; icon: typeof FileText }[] = [
  { value: 'pdf', label: 'PDF', ctaLabel: 'Télécharger le PDF', icon: FileText },
  { value: 'word', label: 'Word', ctaLabel: 'Télécharger le Word', icon: FileText },
];

const LAYOUT_OPTIONS: { value: ExportLayout; label: string }[] = [
  { value: 'list-1col', label: 'Liste' },
  { value: 'grid-2col', label: '2 col.' },
  { value: 'grid-3col', label: '3 col.' },
  { value: 'flashcards', label: 'Cartes' },
  { value: 'table', label: 'Tableau' },
];

const DISPLAY_OPTIONS: { value: ExportDisplay; label: string }[] = [
  { value: 'wordOnly', label: 'Mot seul' },
  { value: 'imageOnly', label: 'Image seule' },
  { value: 'wordAndImage', label: 'Mot + Image' },
];

const INFO_CHIPS: { key: keyof ExportSettings; label: string }[] = [
  { key: 'includePhonemes', label: 'Phonèmes' },
  { key: 'includeCategories', label: 'Catégorie' },
  { key: 'includeSyllableCount', label: 'Nb syllabes' },
  { key: 'includeSyllableSegmentation', label: 'Segmentation' },
  { key: 'numberWords', label: 'Numéroter' },
];

const HEADER_CHIPS: { key: keyof ExportSettings; label: string }[] = [
  { key: 'includeDate', label: 'Date' },
  { key: 'includeWordCount', label: 'Nb mots' },
];

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all',
        active
          ? 'border-[1.5px] border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7]'
          : 'border-[1.5px] border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#C4B8FF] hover:text-[#6C5CE7]'
      )}
    >
      {active && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
      )}
      {label}
    </button>
  );
}

function LayoutCard({ value, label, active, onClick }: { value: ExportLayout; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2.5 rounded-[10px] border-[1.5px] transition-all',
        active
          ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
          : 'border-[#E5E7EB] bg-white hover:border-[#C4B8FF]'
      )}
    >
      <LayoutMiniPreview type={value} active={active} />
      <span className={cn('text-[9px] font-semibold', active ? 'text-[#6C5CE7]' : 'text-[#6B7280]')}>{label}</span>
    </button>
  );
}

function LayoutMiniPreview({ type, active }: { type: ExportLayout; active: boolean }) {
  const borderColor = active ? '#C4B8FF' : '#E5E7EB';
  const base = 'w-[52px] h-[40px] rounded-[3px] overflow-hidden';

  if (type === 'list-1col') {
    return (
      <div className={base} style={{ border: `1px solid ${borderColor}`, background: '#FAFBFC', padding: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 3, borderRadius: 1, background: active ? 'rgba(108,92,231,0.4)' : '#DDD', width: '80%' }} />
        <div style={{ height: 3, borderRadius: 1, background: '#DDD', width: '60%' }} />
        <div style={{ height: 3, borderRadius: 1, background: '#DDD', width: '70%' }} />
        <div style={{ height: 3, borderRadius: 1, background: '#DDD', width: '50%' }} />
      </div>
    );
  }
  if (type === 'grid-2col') {
    return (
      <div className={base} style={{ border: `1px solid ${borderColor}`, background: '#FAFBFC', padding: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <div style={{ borderRadius: 2, background: '#E8E8F0' }} />
        <div style={{ borderRadius: 2, background: '#E8E8F0' }} />
        <div style={{ borderRadius: 2, background: '#E8E8F0' }} />
        <div style={{ borderRadius: 2, background: '#E8E8F0' }} />
      </div>
    );
  }
  if (type === 'grid-3col') {
    return (
      <div className={base} style={{ border: `1px solid ${borderColor}`, background: '#FAFBFC', padding: 3, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
        {[...Array(6)].map((_, i) => <div key={i} style={{ borderRadius: 2, background: '#E8E8F0' }} />)}
      </div>
    );
  }
  if (type === 'flashcards') {
    return (
      <div className={base} style={{ border: `1px solid ${borderColor}`, background: '#FAFBFC', padding: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ borderRadius: 2, background: '#E8E8F0', borderTop: '2px solid rgba(108,92,231,0.3)' }} />)}
      </div>
    );
  }
  // table
  return (
    <div className={base} style={{ border: `1px solid ${borderColor}`, background: '#FAFBFC', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 8, background: '#E8E8F0', borderBottom: '1px solid #DDD' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, padding: 2 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ height: 3, borderRadius: 1, background: i % 2 === 0 ? '#F0F0F0' : '#FAFAFA' }} />)}
      </div>
    </div>
  );
}

export function ExportPanel({ selectedWords, onClose, wordStatuses, currentIndex }: ExportPanelProps) {
  const isSessionMode = !!wordStatuses;
  const [settings, setSettings] = useState<ExportSettings>(() => ({
    ...DEFAULT_EXPORT_SETTINGS,
    title: isSessionMode ? 'Résultats de session' : 'Ma sélection de mots',
  }));

  const updateSetting = <K extends keyof ExportSettings>(key: K, value: ExportSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const currentFormat = FORMAT_OPTIONS.find(f => f.value === settings.format) || FORMAT_OPTIONS[0];

  const handleExport = useCallback(async () => {
    try {
      switch (settings.format) {
        case 'pdf': {
          // Pre-fetch all images as PNG base64 (same pattern as imagier)
          const imageMap = new Map<string, string>();
          const hasImages = settings.display === 'imageOnly' || settings.display === 'wordAndImage';
          if (hasImages) {
            const urls = [...new Set(
              selectedWords
                .map(w => w['image associée']?.trim())
                .filter(Boolean) as string[]
            )];
            await Promise.all(urls.map(async (url) => {
              const dataUri = await loadImageAsBase64ForImagier(url);
              if (dataUri) imageMap.set(url, dataUri);
            }));
          }

          // Generate PDF blob using @react-pdf/renderer (same as imagier)
          const blob = await pdf(
            <ExportPdfDocument
              words={selectedWords}
              settings={settings}
              imageMap={imageMap}
              wordStatuses={wordStatuses}
              currentIndex={currentIndex}
            />
          ).toBlob();

          // Trigger download (same as imagier)
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `mots-${new Date().toISOString().split('T')[0]}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success('PDF téléchargé avec succès !');
          break;
        }
        case 'word':
          await exportToWord(selectedWords, settings, wordStatuses, currentIndex);
          toast.success('Document Word téléchargé avec succès !');
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'export. Veuillez réessayer.');
    }
  }, [selectedWords, settings, wordStatuses, currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleExport();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handleExport]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0F1423]/45 backdrop-blur-[4px] z-[100] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto animate-in zoom-in-95 fade-in duration-300 overflow-hidden font-dm-sans"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ===== HEADER (clean, like PanelHeader) ===== */}
          <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center gap-3">
            <div className="w-8 h-8 rounded-[10px] bg-[#F5F3FF] flex items-center justify-center text-[#6C5CE7] shrink-0">
              <Download className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="font-sora text-[16px] font-bold text-[#1A1A2E] leading-tight">
                {isSessionMode ? 'Exporter les résultats' : 'Exporter la liste'}
              </h2>
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                {selectedWords.length} mots
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] flex-shrink-0"
            >
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </div>

          {/* ===== BODY: Tabbed Options + Preview ===== */}
          <div className="flex-1 flex overflow-hidden min-h-0">

            {/* LEFT: Tabbed options panel */}
            <div className="w-[360px] border-r border-[#F1F5F9] flex flex-col bg-[#FAFBFC]">
              <PanelTabs defaultValue="document" className="flex flex-col flex-1 min-h-0">
                <PanelTabsList className="mx-4 mt-3 mb-0">
                  <PanelTabsTrigger value="document">Document</PanelTabsTrigger>
                  <PanelTabsTrigger value="contenu">Contenu</PanelTabsTrigger>
                </PanelTabsList>

                {/* ── TAB: Document ── */}
                <PanelTabsContent value="document">
                  <div className="flex flex-col gap-6 py-5">
                    {/* En-tête du document */}
                    <div className="px-5">
                      <SectionHeader label="En-tête du document" />
                      <div className="flex flex-col gap-2.5">
                        <div>
                          <label className="text-[11px] font-medium text-[#9CA3AF] mb-1 block">Titre</label>
                          <input
                            type="text"
                            value={settings.title}
                            onChange={(e) => updateSetting('title', e.target.value)}
                            placeholder="Titre du document"
                            className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white text-[13px] font-medium text-[#1A1A2E] focus:border-[#6C5CE7] focus:outline-none focus:ring-[3px] focus:ring-[#6C5CE7]/8 transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[#9CA3AF] mb-1 block">
                            Sous-titre <span className="text-[#C4C8D0]">(optionnel)</span>
                          </label>
                          <input
                            type="text"
                            value={settings.subtitle}
                            onChange={(e) => updateSetting('subtitle', e.target.value)}
                            placeholder="Ex: Séance du 17/02/2026"
                            className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white text-[13px] font-medium text-[#1A1A2E] placeholder:text-[#C4C8D0] focus:border-[#6C5CE7] focus:outline-none focus:ring-[3px] focus:ring-[#6C5CE7]/8 transition-all"
                          />
                        </div>
                        <div className="flex gap-1.5 flex-wrap mt-1">
                          {HEADER_CHIPS.map(({ key, label }) => (
                            <Chip
                              key={key}
                              active={settings[key] as boolean}
                              label={label}
                              onClick={() => updateSetting(key, !settings[key])}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Mise en page */}
                    <div className="px-5">
                      <SectionHeader label="Mise en page" />
                      <div className="grid grid-cols-5 gap-1.5">
                        {LAYOUT_OPTIONS.map(({ value, label }) => (
                          <LayoutCard
                            key={value}
                            value={value}
                            label={label}
                            active={settings.layout === value}
                            onClick={() => updateSetting('layout', value)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </PanelTabsContent>

                {/* ── TAB: Contenu ── */}
                <PanelTabsContent value="contenu">
                  <div className="flex flex-col gap-6 py-5">
                    {/* Affichage */}
                    <div className="px-5">
                      <SectionHeader label="Affichage" />
                      <select
                        value={settings.display}
                        onChange={(e) => updateSetting('display', e.target.value as ExportDisplay)}
                        className="w-full px-3.5 py-2.5 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white text-[13px] font-medium text-[#1A1A2E] focus:border-[#6C5CE7] focus:outline-none transition-colors appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]"
                      >
                        {DISPLAY_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Informations par mot */}
                    <div className="px-5">
                      <SectionHeader label="Informations par mot" />
                      <div className="flex flex-wrap gap-1.5">
                        {INFO_CHIPS.map(({ key, label }) => (
                          <Chip
                            key={key}
                            active={settings[key] as boolean}
                            label={label}
                            onClick={() => updateSetting(key, !settings[key])}
                          />
                        ))}
                      </div>

                      {/* Mini word preview */}
                      {selectedWords.length > 0 && (
                        <div className="mt-3 p-3 bg-[#FAFBFC] rounded-[10px] border border-[#E5E7EB]">
                          <div className="text-[9px] font-semibold text-[#C4C8D0] uppercase tracking-[0.05em] mb-2">Aperçu par mot</div>
                          <div className="flex items-center gap-2">
                            {(settings.display === 'imageOnly' || settings.display === 'wordAndImage') && (
                              <div className="w-8 h-8 rounded-md bg-[#F0EDFF] border border-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                              </div>
                            )}
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {settings.numberWords && (
                                  <span className="text-[11px] font-semibold text-[#6C5CE7]">1.</span>
                                )}
                                {settings.display !== 'imageOnly' && (
                                  <span className="text-[13px] font-semibold text-[#1A1A2E]">{selectedWords[0].MOTS}</span>
                                )}
                                {settings.includeCategories && selectedWords[0].SYNT && (
                                  <span className="text-[9px] font-semibold text-[#9CA3AF] bg-[#F3F4F6] px-1.5 py-0.5 rounded">{selectedWords[0].SYNT}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                {settings.includePhonemes && selectedWords[0].PHONEMES && (
                                  <span className="text-[11px] text-[#6C5CE7] italic font-mono">/{selectedWords[0].PHONEMES}/</span>
                                )}
                                {settings.includeSyllableCount && selectedWords[0].NBSYLL && (
                                  <span className="text-[10px] text-[#6B7280]">{selectedWords[0].NBSYLL} syll.</span>
                                )}
                                {settings.includeSyllableSegmentation && selectedWords[0]["segmentation syllabique"] && (
                                  <span className="text-[10px] text-[#10B981] font-mono">{selectedWords[0]["segmentation syllabique"]}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </PanelTabsContent>
              </PanelTabs>
            </div>

            {/* RIGHT: A4 Preview */}
            <ExportPreview words={selectedWords} settings={settings} wordStatuses={wordStatuses} currentIndex={currentIndex} />
          </div>

          {/* ===== FOOTER: Format selector + CTA ===== */}
          <div className="px-5 py-3 border-t border-[#F1F5F9] bg-[#FAFBFC] flex items-center justify-between">
            {/* Format toggle bar */}
            <div className="flex gap-1 p-1 bg-[#F1F2F6] rounded-[10px]">
              {FORMAT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('format', value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all',
                    settings.format === value
                      ? 'bg-white text-[#6C5CE7] shadow-sm'
                      : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
            {/* CTA */}
            <button
              onClick={handleExport}
              className="px-5 py-2.5 rounded-[12px] bg-[#6C5CE7] text-white font-sora text-[13px] font-bold shadow-[0_3px_12px_rgba(108,92,231,0.25)] hover:bg-[#5A4BD1] transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              {currentFormat.ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
