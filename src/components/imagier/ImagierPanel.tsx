import { useState } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, GRID_OPTIONS } from '@/types/imagier';
import { LayoutGrid, FileText, ArrowDownUp, Scissors, Printer } from 'lucide-react';
import { getDeterminer, formatPhonemes } from '@/utils/imagier-utils';

interface ImagierPanelProps {
  settings: ImagierSettings;
  updateSetting: <K extends keyof ImagierSettings>(key: K, value: ImagierSettings[K]) => void;
  words: Word[];
  removedCount: number;
  onReorder: (from: number, to: number) => void;
  onPrint: () => void;
}

type TabId = 'mise-en-page' | 'contenu' | 'ordre';

export function ImagierPanel({ settings, updateSetting, words, removedCount, onReorder, onPrint }: ImagierPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('mise-en-page');
  const [listDragSrc, setListDragSrc] = useState<number | null>(null);
  const [listDragOver, setListDragOver] = useState<number | null>(null);

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'mise-en-page', label: 'Mise en page', icon: <LayoutGrid className="w-[15px] h-[15px]" /> },
    { id: 'contenu', label: 'Contenu', icon: <FileText className="w-[15px] h-[15px]" /> },
    { id: 'ordre', label: 'Ordre', icon: <ArrowDownUp className="w-[15px] h-[15px]" /> },
  ];

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[440px] bg-white border-l border-[#E5E7EB] flex flex-col print:hidden z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.06)]">
      {/* Tabs */}
      <div className="flex border-b border-[#E5E7EB] flex-shrink-0 bg-[#FAFBFC]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3.5 px-4 text-[13px] font-semibold font-['DM_Sans'] text-center transition-all border-b-2 flex items-center justify-center gap-1.5
              ${activeTab === tab.id
                ? 'text-[#6C5CE7] border-[#6C5CE7] bg-white'
                : 'text-[#9CA3AF] border-transparent hover:text-[#374151]'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">

        {/* ========== TAB: MISE EN PAGE ========== */}
        {activeTab === 'mise-en-page' && (
          <div>
            {/* Grid selector */}
            <Section label="Disposition" icon={<LayoutGrid className="w-[13px] h-[13px] opacity-40" />}>
              <div className="grid grid-cols-4 gap-2">
                {GRID_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateSetting('grid', opt.value)}
                    className={`py-2.5 px-1 border-[1.5px] rounded-[10px] text-center transition-all
                      ${settings.grid === opt.value
                        ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                      }
                    `}
                  >
                    <GridVisual cols={opt.cols} rows={opt.rows} active={settings.grid === opt.value} />
                    <div className={`font-sora text-xs font-bold mt-1.5 ${settings.grid === opt.value ? 'text-[#6C5CE7]' : 'text-[#374151]'}`}>
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-[#9CA3AF] mt-px">
                      {opt.cols * opt.rows} / page
                    </div>
                  </button>
                ))}
              </div>
            </Section>

            {/* Orientation */}
            <Section label="Orientation" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>}>
              <div className="grid grid-cols-2 gap-2.5">
                {(['portrait', 'landscape'] as const).map(o => (
                  <button
                    key={o}
                    onClick={() => updateSetting('orientation', o)}
                    className={`flex flex-col items-center gap-2 p-3.5 border-[1.5px] rounded-[10px] transition-all
                      ${settings.orientation === o
                        ? 'border-[#6C5CE7] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#A29BFE]'
                      }
                    `}
                  >
                    <div className={`border-2 rounded-[3px] relative transition-colors
                      ${settings.orientation === o ? 'border-[#6C5CE7]' : 'border-[#E5E7EB]'}
                      ${o === 'portrait' ? 'w-[22px] h-[30px]' : 'w-[30px] h-[22px]'}
                    `}>
                      <div className={`absolute top-[3px] left-[3px] right-[3px] h-[2px] rounded-sm transition-colors ${settings.orientation === o ? 'bg-[#6C5CE7]' : 'bg-[#E5E7EB]'}`} />
                    </div>
                    <span className={`text-xs font-semibold ${settings.orientation === o ? 'text-[#6C5CE7]' : 'text-[#6B7280]'}`}>
                      {o === 'portrait' ? 'Portrait' : 'Paysage'}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            {/* Show header toggle */}
            <Section noBorder>
              <ToggleRow
                icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}
                label="En-tête de page"
                desc="Titre, sous-titre et compteur de mots"
                isOn={settings.showHeader}
                onToggle={() => updateSetting('showHeader', !settings.showHeader)}
              />
            </Section>

            {/* Title */}
            {settings.showHeader && (
            <Section label="Titre" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}>
              <input
                type="text"
                value={settings.title}
                onChange={e => updateSetting('title', e.target.value)}
                placeholder="ex : Les animaux, Le son [s]..."
                className="w-full px-3.5 py-2.5 border-[1.5px] border-[#E5E7EB] rounded-[10px] text-sm font-['DM_Sans'] font-medium text-[#1A1A2E] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
              />
              <div className="h-2" />
              <input
                type="text"
                value={settings.subtitle}
                onChange={e => updateSetting('subtitle', e.target.value)}
                placeholder="Sous-titre (nom patient, date...)"
                className="w-full px-3.5 py-2 border-[1.5px] border-[#E5E7EB] rounded-[10px] text-xs font-['DM_Sans'] font-medium text-[#6B7280] bg-white placeholder:text-[#9CA3AF] placeholder:font-normal focus:outline-none focus:border-[#6C5CE7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.12)] transition-all"
              />
              <div className="text-[11px] text-[#9CA3AF] mt-1.5 italic">
                Le titre et sous-titre apparaissent en haut de chaque page
              </div>
            </Section>
            )}

            {/* Cutting guides */}
            <Section noBorder>
              <ToggleRow
                icon={<Scissors className="w-4 h-4" />}
                label="Traits de découpe"
                desc="Pointillés entre les cartes pour découper"
                isOn={settings.cuttingGuides}
                onToggle={() => updateSetting('cuttingGuides', !settings.cuttingGuides)}
              />
            </Section>

            {/* Warning */}
            {removedCount > 0 && (
              <div className="px-6 py-4 border-t border-[#F1F5F9]">
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
        )}

        {/* ========== TAB: CONTENU ========== */}
        {activeTab === 'contenu' && (
          <div>
            <Section label="Texte du mot" icon={<svg className="w-[13px] h-[13px] opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>}>
              <div className="flex flex-col gap-0.5">
                <ToggleRow icon="Aa" label="Mot" desc="Le mot écrit sous l'image" isOn={settings.showWord} onToggle={() => updateSetting('showWord', !settings.showWord)} />
                <ToggleRow icon="le" label="Déterminant" desc="Affiche le/la/un/une devant le mot" isOn={settings.showDeterminer} onToggle={() => updateSetting('showDeterminer', !settings.showDeterminer)} />
              </div>

              {/* Casse */}
              <div className="mt-3.5">
                <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Casse du mot</div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'lower' as const, label: 'minuscule', display: 'chat' },
                    { value: 'upper' as const, label: 'MAJUSCULE', display: 'CHAT' },
                    { value: 'capitalize' as const, label: 'Capitale', display: 'Chat' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('casse', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center text-xs font-semibold font-['DM_Sans'] transition-all
                        ${settings.casse === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div>{opt.display}</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div className="mt-3.5">
                <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] mb-2">Taille de police</div>
                <div className="flex gap-1.5">
                  {([
                    { value: 'small' as const, label: 'Petit', size: '11px' },
                    { value: 'medium' as const, label: 'Moyen', size: '14px' },
                    { value: 'large' as const, label: 'Grand', size: '18px' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting('fontSize', opt.value)}
                      className={`flex-1 py-2 px-2 border-[1.5px] rounded-lg text-center text-xs font-semibold font-['DM_Sans'] transition-all
                        ${settings.fontSize === opt.value
                          ? 'border-[#6C5CE7] bg-[#F5F3FF] text-[#6C5CE7] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]'
                          : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#A29BFE]'
                        }
                      `}
                    >
                      <div style={{ fontSize: opt.size }}>A</div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* Additional info */}
            <Section label="Informations supplémentaires" icon={<FileText className="w-[13px] h-[13px] opacity-40" />}>
              <div className="flex flex-col gap-0.5">
                <ToggleRow icon="a-b" label="Segmentation syllabique" desc="Affiche la décomposition (cha-peau)" isOn={settings.showSyllBreak} onToggle={() => updateSetting('showSyllBreak', !settings.showSyllBreak)} />
                <ToggleRow icon="/a/" label="Transcription phonétique" desc="API sous le mot" isOn={settings.showPhoneme} onToggle={() => updateSetting('showPhoneme', !settings.showPhoneme)} />
                <ToggleRow icon="NC" label="Catégorie syntaxique" desc="Nom, verbe, adjectif..." isOn={settings.showCategory} onToggle={() => updateSetting('showCategory', !settings.showCategory)} />
                <ToggleRow icon="2s" label="Nombre de syllabes" desc="Badge avec le compte syllabique" isOn={settings.showSyllCount} onToggle={() => updateSetting('showSyllCount', !settings.showSyllCount)} />
              </div>
            </Section>
          </div>
        )}

        {/* ========== TAB: ORDRE ========== */}
        {activeTab === 'ordre' && (
          <div>
            <Section label="Ordre des mots" icon={<ArrowDownUp className="w-[13px] h-[13px] opacity-40" />} badge={`${words.length} mots`}>
              <div className="flex flex-col gap-0.5">
                {words.map((w, i) => (
                  <div
                    key={w.uid || w.MOTS + i}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-grab select-none transition-colors hover:bg-[#FAFBFC] ${listDragSrc === i ? 'opacity-40' : ''}`}
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
                    <div className="text-[#E5E7EB] text-[10px] cursor-grab">⁞⁞</div>
                    {w["image associée"] && (
                      <div className="w-7 h-7 rounded-md overflow-hidden flex-shrink-0">
                        <img src={w["image associée"]} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1A1A2E]">
                        {getDeterminer(w) ? getDeterminer(w) + ' ' : ''}{w.MOTS}
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] italic">
                        {formatPhonemes(w.PHONEMES)} · {w.NBSYLL} syll.
                      </div>
                    </div>
                    <div className="text-[10px] font-semibold text-[#9CA3AF] bg-[#FAFBFC] px-1.5 py-0.5 rounded">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Print CTA — sticky footer */}
      <div className="flex-shrink-0 p-5 border-t border-[#E5E7EB] bg-[#FAFBFC]">
        <button
          onClick={onPrint}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold font-['DM_Sans'] bg-[#6C5CE7] text-white shadow-[0_2px_8px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] hover:-translate-y-px transition-all"
        >
          <Printer className="w-4 h-4" />
          Imprimer l'imagier
        </button>
      </div>
    </div>
  );
}

/* ===== Sub-components ===== */

function Section({ label, icon, badge, noBorder, children }: {
  label?: string;
  icon?: React.ReactNode;
  badge?: string;
  noBorder?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`px-6 py-4 ${noBorder ? '' : 'border-b border-[#F1F5F9]'}`}>
      {label && (
        <div className="flex items-center justify-between mb-3">
          <div className="font-sora text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-1.5">
            {icon}
            {label}
          </div>
          {badge && (
            <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function ToggleRow({ icon, label, desc, isOn, onToggle }: {
  icon: React.ReactNode | string;
  label: string;
  desc: string;
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center justify-between py-2.5 px-3.5 rounded-[10px] border-[1.5px] cursor-pointer transition-all
        ${isOn ? 'bg-[#F5F3FF] border-[rgba(108,92,231,0.15)]' : 'border-transparent hover:bg-[#FAFBFC]'}
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold font-sora flex-shrink-0 transition-all
          ${isOn ? 'bg-white text-[#6C5CE7] shadow-[0_1px_4px_rgba(108,92,231,0.12)]' : 'bg-[#FAFBFC] text-[#9CA3AF]'}
        `}>
          {typeof icon === 'string' ? icon : icon}
        </div>
        <div>
          <div className="text-[13px] font-semibold text-[#374151]">{label}</div>
          <div className="text-[11px] text-[#9CA3AF] mt-px">{desc}</div>
        </div>
      </div>
      <div className={`w-10 h-[22px] rounded-full relative transition-colors flex-shrink-0 ${isOn ? 'bg-[#6C5CE7]' : 'bg-[#D1D5DB]'}`}>
        <div className={`w-[18px] h-[18px] rounded-full bg-white absolute top-[2px] transition-[left] shadow-[0_1px_3px_rgba(0,0,0,0.12)] ${isOn ? 'left-5' : 'left-[2px]'}`} />
      </div>
    </div>
  );
}

function GridVisual({ cols, rows, active }: { cols: number; rows: number; active: boolean }) {
  const cells = Array.from({ length: cols * rows });
  const sizes: Record<number, string> = { 2: '9px', 3: '7px', 4: '6px' };
  const cellSize = sizes[cols] || '7px';

  return (
    <div
      className="grid gap-[2px] mx-auto w-fit mb-1"
      style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize})` }}
    >
      {cells.map((_, i) => (
        <div
          key={i}
          className={`aspect-square rounded-[1.5px] transition-colors ${active ? 'bg-[#6C5CE7]' : 'bg-[#E5E7EB]'}`}
          style={{ width: cellSize }}
        />
      ))}
    </div>
  );
}
