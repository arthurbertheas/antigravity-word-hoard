import { useState } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, LAYOUT_OPTIONS, PageStyle } from '@/types/imagier';
import { LayoutGrid, FileText, ArrowDownUp, Scissors, Printer, GripVertical, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { getDeterminer, formatPhonemes } from '@/utils/imagier-utils';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { PanelTabs, PanelTabsList, PanelTabsTrigger, PanelTabsContent } from '@/components/ui/PanelTabs';
import { ToggleRow } from '@/components/ui/ToggleRow';

interface ImagierPanelProps {
  settings: ImagierSettings;
  updateSetting: <K extends keyof ImagierSettings>(key: K, value: ImagierSettings[K]) => void;
  words: Word[];
  removedCount: number;
  onReorder: (from: number, to: number) => void;
  onPrint: () => void;
  isPrinting?: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

type TabId = 'layout' | 'content' | 'order';

export function ImagierPanel({ settings, updateSetting, words, removedCount, onReorder, onPrint, isPrinting, isOpen, onToggle }: ImagierPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [listDragSrc, setListDragSrc] = useState<number | null>(null);
  const [listDragOver, setListDragOver] = useState<number | null>(null);

  const portraitOptions = LAYOUT_OPTIONS.filter(o => o.orientation === 'portrait');
  const landscapeOptions = LAYOUT_OPTIONS.filter(o => o.orientation === 'landscape');

  return (
    <aside className={`shrink-0 bg-white flex flex-col h-full border-l border-[#E5E7EB] transition-width-smooth overflow-hidden print:hidden z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.06)] ${isOpen ? 'w-[400px]' : 'w-[64px]'}`}>

      {/* ===== Collapsed mini-bar ===== */}
      {!isOpen && (
        <div className="flex flex-col items-center py-4 gap-4 h-full animate-in fade-in duration-300">
          <button
            onClick={onToggle}
            className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] flex-shrink-0"
            title="Ouvrir le panneau"
          >
            <ChevronsLeft className="w-4 h-4" strokeWidth={1.8} />
          </button>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-[12px] bg-[#F0EDFF] flex items-center justify-center text-[#6C5CE7]">
              <LayoutGrid className="w-5 h-5" />
            </div>
            {words.length > 0 && (
              <div className="min-w-[24px] h-6 rounded-lg bg-[#6C5CE7] text-white text-[12px] font-bold font-['IBM_Plex_Mono'] flex items-center justify-center px-1.5 shadow-sm">
                {words.length}
              </div>
            )}
          </div>

          <div className="flex-1" />

          <button
            onClick={onPrint}
            disabled={isPrinting}
            className={`w-11 h-11 rounded-[14px] bg-[#6C5CE7] text-white flex items-center justify-center shadow-[0_3px_12px_rgba(108,92,231,0.35)] transition-all mb-2 ${isPrinting ? 'opacity-60 cursor-wait' : 'hover:bg-[#5A4BD1] hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(108,92,231,0.4)]'}`}
            title="Exporter l'imagier en PDF"
          >
            {isPrinting
              ? <div className="w-[18px] h-[18px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Printer className="w-[18px] h-[18px]" />
            }
          </button>
        </div>
      )}

      {/* ===== Expanded panel ===== */}
      {isOpen && (
        <>
          <PanelHeader
            title="Imagier"
            subtitle="Mise en page et impression"
            icon={
              <div className="w-8 h-8 rounded-[10px] bg-[#F5F3FF] flex items-center justify-center text-[#6C5CE7]">
                <LayoutGrid className="w-4 h-4" />
              </div>
            }
            hideBorder
            action={
              <button
                onClick={onToggle}
                className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] group"
                title="Réduire le panneau"
              >
                <ChevronsRight className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
              </button>
            }
          />
      {/* Divider between header and tabs */}
      <div className="border-b border-[#F1F5F9]" />
      <PanelTabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)} className="flex-1 flex flex-col overflow-hidden">
        <PanelTabsList>
          <PanelTabsTrigger value="layout">
            <LayoutGrid className={`w-[15px] h-[15px] ${activeTab === 'layout' ? 'text-[#6C5CE7]' : 'opacity-60'}`} />
            Mise en page
          </PanelTabsTrigger>
          <PanelTabsTrigger value="content">
            <FileText className={`w-[15px] h-[15px] ${activeTab === 'content' ? 'text-[#6C5CE7]' : 'opacity-60'}`} />
            Contenu
          </PanelTabsTrigger>
          <PanelTabsTrigger value="order">
            <ArrowDownUp className={`w-[15px] h-[15px] ${activeTab === 'order' ? 'text-[#6C5CE7]' : 'opacity-60'}`} />
            Ordre
          </PanelTabsTrigger>
        </PanelTabsList>

        {/* Tab content — scrollable area */}
        <div className="flex-1 overflow-y-auto">

          {/* ========== TAB: MISE EN PAGE ========== */}
          <PanelTabsContent value="layout">
            {/* panel-scroll: gap 24px, padding 20px 0 */}
            <div className="flex flex-col gap-6 py-5">

              {/* Section: Style de la page */}
              <div className="px-5">
                <SectionHeader label="Style de la page" />
                <div className="grid grid-cols-3 gap-1.5">
                  <PageStyleThumb
                    value="grid"
                    label="Grille"
                    active={settings.pageStyle === 'grid'}
                    onClick={() => updateSetting('pageStyle', 'grid')}
                    icon={
                      <svg viewBox="0 0 40 40" fill="none">
                        {[0,1,2].map(r => [0,1,2].map(c => (
                          <rect key={`${r}-${c}`} x={2+c*13} y={2+r*13} width={11} height={11} rx={2} fill={settings.pageStyle==='grid'?'#6C5CE7':'#E5E7EB'}/>
                        )))}
                      </svg>
                    }
                  />
                  <PageStyleThumb
                    value="parcours-s"
                    label="Parcours"
                    active={settings.pageStyle === 'parcours-s'}
                    onClick={() => updateSetting('pageStyle', 'parcours-s')}
                    icon={
                      <svg viewBox="0 0 40 40" fill="none">
                        {/* Rectangular perimeter loop */}
                        <polyline points="4,8 14,8 26,8 36,8 36,18 36,30 26,30 14,30 4,30 4,18"
                          stroke={settings.pageStyle==='parcours-s'?'#A29BFE':'#D1D5DB'} strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                        <polyline points="4,8 14,8 26,8 36,8 36,18 36,30 26,30 14,30 4,30 4,18"
                          stroke={settings.pageStyle==='parcours-s'?'#6C5CE7':'#9CA3AF'} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
                        <text x="5" y="12" fontFamily="'Sora',sans-serif" fontSize="5" fontWeight="800" fill="white">1</text>
                        <text x="15" y="12" fontFamily="'Sora',sans-serif" fontSize="5" fontWeight="800" fill="white">2</text>
                      </svg>
                    }
                  />
                  <PageStyleThumb
                    value="circulaire"
                    label="Cercle"
                    active={settings.pageStyle === 'circulaire'}
                    onClick={() => updateSetting('pageStyle', 'circulaire')}
                    icon={
                      <svg viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="15" stroke={settings.pageStyle==='circulaire'?'#A29BFE':'#D1D5DB'} strokeWidth="0.8" strokeDasharray="3 2"/>
                        {Array.from({length:8}, (_,i) => {
                          const a = (i/8)*Math.PI*2 - Math.PI/2;
                          const x = 20 + 14*Math.cos(a) - 4;
                          const y = 20 + 14*Math.sin(a) - 3;
                          return <rect key={i} x={x} y={y} width="8" height="6" rx="1.5" fill={settings.pageStyle==='circulaire'?'#6C5CE7':'#E5E7EB'}/>;
                        })}
                      </svg>
                    }
                  />
                </div>
              </div>

              {/* Section: Cases par page (hors grille) */}
              {settings.pageStyle !== 'grid' && (
                <div className="px-5">
                  <SectionHeader label="Cases par page" />
                  <ParcoursPerPageField
                    value={settings.parcoursPerPage}
                    onChange={v => updateSetting('parcoursPerPage', v)}
                  />
                </div>
              )}

              {/* Section: Disposition (grille uniquement) */}
              {settings.pageStyle === 'grid' && (
                <div className="px-5">
                  <SectionHeader label="Disposition" />
                  <div className="flex gap-2 overflow-x-auto py-0.5">
                    {portraitOptions.map(opt => {
                      const active = settings.grid === opt.grid && settings.orientation === opt.orientation;
                      return (
                        <LayoutThumb
                          key={`${opt.grid}-${opt.orientation}`}
                          cols={opt.cols}
                          rows={opt.rows}
                          label={opt.label}
                          pageW={36}
                          pageH={50}
                          active={active}
                          onClick={() => {
                            updateSetting('grid', opt.grid);
                            updateSetting('orientation', opt.orientation);
                          }}
                        />
                      );
                    })}
                    {/* Separator */}
                    <div className="w-px flex-shrink-0 bg-[#F1F5F9] my-1" />
                    {landscapeOptions.map(opt => {
                      const active = settings.grid === opt.grid && settings.orientation === opt.orientation;
                      return (
                        <LayoutThumb
                          key={`${opt.grid}-${opt.orientation}`}
                          cols={opt.cols}
                          rows={opt.rows}
                          label={opt.label}
                          pageW={50}
                          pageH={36}
                          active={active}
                          topOffset={7}
                          onClick={() => {
                            updateSetting('grid', opt.grid);
                            updateSetting('orientation', opt.orientation);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section: Options de page */}
              <div className="px-5">
                <SectionHeader label="Options de page" />
                {/* section-group: gap 10px */}
                <div className="flex flex-col gap-2.5">
                  <ToggleRow
                    icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}
                    label="En-tête de page"
                    desc="Titre, sous-titre et compteur"
                    checked={settings.showHeader}
                    onCheckedChange={() => updateSetting('showHeader', !settings.showHeader)}
                  >
                    <input
                      type="text"
                      value={settings.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={e => updateSetting('title', e.target.value)}
                      placeholder="ex : Les animaux, Le son [s]..."
                      className="w-full px-3 py-2 border-[1.5px] border-[#E5E7EB] rounded-[10px] text-[13px] font-['DM_Sans'] font-medium text-[#1A1A2E] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
                    />
                    <div className="h-1.5" />
                    <input
                      type="text"
                      value={settings.subtitle}
                      onClick={(e) => e.stopPropagation()}
                      onChange={e => updateSetting('subtitle', e.target.value)}
                      placeholder="Sous-titre (nom patient, date...)"
                      className="w-full px-3 py-[7px] border-[1.5px] border-[#E5E7EB] rounded-[10px] text-xs font-['DM_Sans'] font-medium text-[#6B7280] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
                    />
                  </ToggleRow>
                  <ToggleRow
                    icon={<Scissors className="w-4 h-4" />}
                    label="Traits de découpe"
                    desc="Pointillés pour découper"
                    checked={settings.cuttingGuides}
                    onCheckedChange={() => updateSetting('cuttingGuides', !settings.cuttingGuides)}
                  />
                </div>
              </div>

              {/* Section: Espacement et marges */}
              <div className="px-5">
                <SectionHeader label="Espacement et marges" />
                <div className="border-[1.5px] border-[#F1F5F9] rounded-[14px] bg-[#FAFBFC] overflow-hidden">
                  {/* Note when cutting guides are active */}
                  {settings.cuttingGuides && (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#FFFBEB] border-b border-[#FEF3C7] text-[11.5px] text-[#92400E]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                      Espacements ignorés avec les traits de découpe
                    </div>
                  )}
                  {/* Entre les colonnes (hGap) */}
                  <SpacingField
                    label="Entre les colonnes"
                    value={settings.hGap}
                    onChange={v => updateSetting('hGap', v)}
                    disabled={settings.cuttingGuides}
                  />
                  {/* Entre les lignes (vGap) */}
                  <SpacingField
                    label="Entre les lignes"
                    value={settings.vGap}
                    onChange={v => updateSetting('vGap', v)}
                    disabled={settings.cuttingGuides}
                    withTopBorder
                  />
                  {/* Marge de page */}
                  <SpacingField
                    label="Marge de page"
                    value={settings.margin}
                    onChange={v => updateSetting('margin', v)}
                    withTopBorder
                  />
                </div>
              </div>

              {/* Warning (only if needed) */}
              {removedCount > 0 && (
                <div className="px-5">
                  <div className="flex items-start gap-2.5 p-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] text-xs leading-relaxed text-[#92400E]">
                    <div className="w-[18px] h-[18px] rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-px">
                      !
                    </div>
                    <div>
                      <strong>{removedCount} mot{removedCount > 1 ? 's' : ''} sans image</strong> {removedCount > 1 ? 'ont été retirés' : 'a été retiré'} automatiquement de l'imagier.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PanelTabsContent>

          {/* ========== TAB: CONTENU ========== */}
          <PanelTabsContent value="content">
            <div className="flex flex-col gap-6 py-5">
              {/* Section: Texte du mot */}
              <div className="px-5">
                <SectionHeader label="Texte du mot" />
                <div className="flex flex-col gap-2.5">
                  <ToggleRow icon="Aa" label="Mot" desc="Le mot écrit sous l'image" checked={settings.showWord} onCheckedChange={() => updateSetting('showWord', !settings.showWord)} />
                  <ToggleRow icon="le" label="Déterminant" desc="Affiche le/la/un/une devant le mot" checked={settings.showDeterminer} onCheckedChange={() => updateSetting('showDeterminer', !settings.showDeterminer)} />
                </div>
              </div>

              {/* Section: Casse du mot */}
              <div className="px-5">
                <SectionHeader label="Casse du mot" />
                <div className="flex gap-1.5">
                  {([
                    { value: 'lower' as const, label: 'minuscule', display: 'chaton' },
                    { value: 'upper' as const, label: 'MAJUSCULE', display: 'CHATON' },
                    { value: 'capitalize' as const, label: 'Capitale', display: 'Chaton' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('casse', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center transition-all
                        ${settings.casse === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div className={`text-sm font-semibold ${settings.casse === opt.value ? 'text-[#6C5CE7]' : 'text-[#6B7280]'}`}>{opt.display}</div>
                      <div className={`text-[9px] mt-0.5 ${settings.casse === opt.value ? 'text-[#6C5CE7]' : 'text-[#9CA3AF]'}`}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section: Taille de police */}
              <div className="px-5">
                <SectionHeader label="Taille de police" />
                <div className="flex gap-1.5">
                  {([
                    { value: 'small' as const, label: 'Petit', size: '11px' },
                    { value: 'medium' as const, label: 'Moyen', size: '15px' },
                    { value: 'large' as const, label: 'Grand', size: '20px' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('fontSize', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center transition-all
                        ${settings.fontSize === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div className={`font-bold ${settings.fontSize === opt.value ? 'text-[#6C5CE7]' : 'text-[#6B7280]'}`} style={{ fontSize: opt.size }}>A</div>
                      <div className={`text-[9px] mt-0.5 ${settings.fontSize === opt.value ? 'text-[#6C5CE7]' : 'text-[#9CA3AF]'}`}>{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section: Informations supplémentaires */}
              <div className="px-5">
                <SectionHeader label="Informations supplémentaires" />
                <div className="flex flex-col gap-2.5">
                  <ToggleRow icon="a-b" label="Segmentation syllabique" desc="Affiche la décomposition (cha-peau)" checked={settings.showSyllBreak} onCheckedChange={() => updateSetting('showSyllBreak', !settings.showSyllBreak)} />
                  <ToggleRow icon="/a/" label="Transcription phonétique" desc="API sous le mot" checked={settings.showPhoneme} onCheckedChange={() => updateSetting('showPhoneme', !settings.showPhoneme)} />
                  <ToggleRow icon="NC" label="Catégorie syntaxique" desc="Nom, verbe, adjectif..." checked={settings.showCategory} onCheckedChange={() => updateSetting('showCategory', !settings.showCategory)} />
                  <ToggleRow icon="2s" label="Nombre de syllabes" desc="Badge avec le compte syllabique" checked={settings.showSyllCount} onCheckedChange={() => updateSetting('showSyllCount', !settings.showSyllCount)} />
                </div>
              </div>
            </div>
          </PanelTabsContent>

          {/* ========== TAB: ORDRE ========== */}
          <PanelTabsContent value="order">
            <div className="flex flex-col gap-6 py-5">
              <div className="px-5">
                <SectionHeader label="Ordre des mots" badge={`${words.length} mots`} />
                <div className="flex flex-col gap-1.5" onDragOver={e => e.preventDefault()}>
                  {words.map((w, i) => (
                    <div
                      key={w.uid || w.MOTS + i}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] cursor-grab select-none transition-all border border-[#F1F5F9] hover:border-[#E5E7EB] bg-[#FAFBFC] ${listDragSrc === i ? 'opacity-40' : ''}`}
                      draggable
                      onDragStart={() => setListDragSrc(i)}
                      onDragEnd={() => { setListDragSrc(null); setListDragOver(null); }}
                      onDragOver={(e) => { e.preventDefault(); setListDragOver(i); }}
                      onDragLeave={() => setListDragOver(null)}
                      onDrop={() => {
                        if (listDragSrc !== null && listDragSrc !== i) {
                          onReorder(listDragSrc, i);
                        }
                        setListDragSrc(null);
                        setListDragOver(null);
                      }}
                      style={{ borderTop: listDragOver === i ? '2px solid #6C5CE7' : undefined }}
                    >
                      <GripVertical className="w-4 h-4 text-[#9CA3AF] flex-shrink-0 cursor-grab" />
                      {w["image associée"] && (
                        <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0 bg-[#F1F5F9]">
                          <img src={w["image associée"]} alt="" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-[#1A1A2E]">
                          {getDeterminer(w) ? getDeterminer(w) + ' ' : ''}{w.MOTS}
                        </div>
                        <div className="text-[10px] text-[#9CA3AF] italic">
                          {formatPhonemes(w.PHONEMES)} · {w.NBSYLL} syll.
                        </div>
                      </div>
                      <div className="font-sora text-[11px] font-bold text-[#9CA3AF] min-w-[22px] text-center">
                        {String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-3 text-[11px] text-[#9CA3AF] italic">
                  Glissez pour réorganiser l'ordre d'impression
                </div>
              </div>
            </div>
          </PanelTabsContent>
        </div>
      </PanelTabs>

      {/* Print CTA — sticky footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-[#E5E7EB] bg-[#FAFBFC]">
        <button
          onClick={onPrint}
          disabled={isPrinting}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-[14px] font-bold font-sora bg-[#6C5CE7] text-white shadow-[0_3px_12px_rgba(108,92,231,0.25)] transition-all ${isPrinting ? 'opacity-60 cursor-wait' : 'hover:bg-[#5A4BD1] hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(108,92,231,0.35)]'}`}
        >
          {isPrinting
            ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Printer className="w-4 h-4" />
          }
          {isPrinting ? 'Génération du PDF…' : 'Exporter en PDF'}
        </button>
      </div>
        </>
      )}
    </aside>
  );
}

/* ===== Sub-components ===== */

interface PageStyleThumbProps {
  value: PageStyle;
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

function PageStyleThumb({ label, active, onClick, icon }: PageStyleThumbProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 py-2 px-1.5 rounded-[10px] border-[1.5px] transition-all cursor-pointer
        ${active
          ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
          : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
        }`}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <span className={`font-sora text-[9px] font-semibold ${active ? 'text-[#6C5CE7]' : 'text-[#9CA3AF]'}`}>
        {label}
      </span>
    </button>
  );
}

const PARCOURS_PRESETS = [6, 8, 9, 12, 16] as const;

function ParcoursPerPageField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const idx = PARCOURS_PRESETS.indexOf(value as typeof PARCOURS_PRESETS[number]);
  const safeIdx = idx >= 0 ? idx : 2;
  const pct = (safeIdx / (PARCOURS_PRESETS.length - 1)) * 100;

  return (
    <div className="border-[1.5px] border-[#F1F5F9] rounded-[14px] bg-[#FAFBFC] overflow-hidden">
      <div className="flex flex-col gap-2 px-3.5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px] font-medium text-[#374151]">Nombre de cases</span>
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-bold font-sora text-[#6C5CE7] bg-white
              border-[1.5px] border-[#E5E7EB] rounded-[7px] px-2.5 py-0.5 min-w-[36px] text-center">
              {value}
            </span>
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={PARCOURS_PRESETS.length - 1}
          step={1}
          value={safeIdx}
          onChange={e => onChange(PARCOURS_PRESETS[parseInt(e.target.value)])}
          className="w-full h-[3px] rounded-full cursor-pointer appearance-none
            [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:-mt-[5.5px]
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6C5CE7]
            [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(108,92,231,0.35)] [&::-webkit-slider-thumb]:cursor-grab
            [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#6C5CE7]
            [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(108,92,231,0.35)] [&::-moz-range-thumb]:cursor-grab"
          style={{ background: `linear-gradient(to right, #6C5CE7 ${pct}%, #E5E7EB ${pct}%)` }}
        />
        <div className="flex justify-between px-0.5">
          {PARCOURS_PRESETS.map(v => (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`text-[9px] font-sora font-bold transition-colors ${v === value ? 'text-[#6C5CE7]' : 'text-[#9CA3AF] hover:text-[#6B7280]'}`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface LayoutThumbProps {
  cols: number;
  rows: number;
  label: string;
  pageW: number;
  pageH: number;
  active: boolean;
  topOffset?: number;
  onClick: () => void;
}

interface SpacingFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  withTopBorder?: boolean;
}

function SpacingField({ label, value, onChange, disabled = false, withTopBorder = false }: SpacingFieldProps) {
  const clamp = (v: number) => Math.min(50, Math.max(0, v));
  const pct = (value / 50) * 100;

  return (
    <div
      className={`flex flex-col gap-2 px-3.5 py-3 transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : ''} ${withTopBorder ? 'border-t border-[#F1F5F9]' : ''}`}
    >
      {/* Label row + editable value */}
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-[#374151]">{label}</span>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            min={0}
            max={50}
            onChange={e => onChange(clamp(parseInt(e.target.value) || 0))}
            className="w-10 text-center text-[13px] font-bold font-sora text-[#6C5CE7] bg-white
              border-[1.5px] border-[#E5E7EB] rounded-[7px] px-1.5 py-0.5
              outline-none cursor-text
              hover:border-[#A29BFE] hover:bg-[#FAFBFF]
              focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)]
              transition-all
              [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="text-[10.5px] font-bold font-sora text-[#9CA3AF]">mm</span>
        </div>
      </div>
      {/* Slider */}
      <input
        type="range"
        min={0}
        max={50}
        step={1}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-[3px] rounded-full cursor-pointer appearance-none
          [&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[14px] [&::-webkit-slider-thumb]:h-[14px] [&::-webkit-slider-thumb]:-mt-[5.5px]
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#6C5CE7]
          [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(108,92,231,0.35)] [&::-webkit-slider-thumb]:cursor-grab
          [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#6C5CE7]
          [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(108,92,231,0.35)] [&::-moz-range-thumb]:cursor-grab"
        style={{
          background: `linear-gradient(to right, #6C5CE7 ${pct}%, #E5E7EB ${pct}%)`,
        }}
      />
    </div>
  );
}

function LayoutThumb({ cols, rows, label, pageW, pageH, active, topOffset = 0, onClick }: LayoutThumbProps) {
  const cells = Array.from({ length: cols * rows });
  const gap = cols >= 4 ? 1.5 : 2;

  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
      style={{ marginTop: topOffset }}
    >
      <div
        className={`rounded-[4px] border-[1.5px] p-[3px] grid transition-all
          ${active
            ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
            : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
          }
        `}
        style={{
          width: pageW,
          height: pageH,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {cells.map((_, i) => (
          <div
            key={i}
            className={`rounded-[1px] transition-colors ${active ? 'bg-[#6C5CE7]' : 'bg-[#E5E7EB]'}`}
          />
        ))}
      </div>
      <span className={`font-sora text-[9px] font-semibold ${active ? 'text-[#6C5CE7]' : 'text-[#9CA3AF]'}`}>
        {label}
      </span>
    </button>
  );
}
