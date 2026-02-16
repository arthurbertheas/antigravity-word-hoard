import { useState } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, LAYOUT_OPTIONS } from '@/types/imagier';
import { LayoutGrid, FileText, ArrowDownUp, Scissors, Printer } from 'lucide-react';
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
}

type TabId = 'layout' | 'content' | 'order';

export function ImagierPanel({ settings, updateSetting, words, removedCount, onReorder, onPrint }: ImagierPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('layout');
  const [listDragSrc, setListDragSrc] = useState<number | null>(null);
  const [listDragOver, setListDragOver] = useState<number | null>(null);

  const portraitOptions = LAYOUT_OPTIONS.filter(o => o.orientation === 'portrait');
  const landscapeOptions = LAYOUT_OPTIONS.filter(o => o.orientation === 'landscape');

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l border-[#E5E7EB] flex flex-col print:hidden z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.06)]">
      <PanelHeader
        title="Imagier"
        subtitle="Mise en page et impression"
        icon={
          <div className="w-8 h-8 rounded-[10px] bg-[#F5F3FF] flex items-center justify-center text-[#6C5CE7]">
            <LayoutGrid className="w-4 h-4" />
          </div>
        }
        hideBorder
      />
      <PanelTabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <PanelTabsList>
          <PanelTabsTrigger value="layout">
            <LayoutGrid className="w-[15px] h-[15px]" />
            Mise en page
          </PanelTabsTrigger>
          <PanelTabsTrigger value="content">
            <FileText className="w-[15px] h-[15px]" />
            Contenu
          </PanelTabsTrigger>
          <PanelTabsTrigger value="order">
            <ArrowDownUp className="w-[15px] h-[15px]" />
            Ordre
          </PanelTabsTrigger>
        </PanelTabsList>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">

          {/* ========== TAB: MISE EN PAGE ========== */}
          <PanelTabsContent value="layout">
            {/* panel-scroll: gap 24px, padding 20px 0 */}
            <div className="flex flex-col gap-6 py-5">
              {/* Section: Disposition */}
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
                    { value: 'lower' as const, label: 'minuscule', display: 'chat' },
                    { value: 'upper' as const, label: 'MAJUSCULE', display: 'CHAT' },
                    { value: 'capitalize' as const, label: 'Capitale', display: 'Chat' },
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
                <div className="flex flex-col gap-1.5">
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
                      <div className="text-[#E5E7EB] text-[10px] cursor-grab tracking-[-1px]">⁞⁞</div>
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
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] text-[14px] font-bold font-sora bg-[#6C5CE7] text-white shadow-[0_3px_12px_rgba(108,92,231,0.25)] hover:bg-[#5A4BD1] hover:-translate-y-px hover:shadow-[0_5px_16px_rgba(108,92,231,0.35)] transition-all"
        >
          <Printer className="w-4 h-4" />
          Imprimer l'imagier
        </button>
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

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
