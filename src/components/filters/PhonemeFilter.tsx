import { useState, useRef, useEffect } from "react";
import { FilterSection } from "./FilterSection";
import { FilterTag } from "./FilterTag";
import { ModeToggle } from "./ModeToggle";
import { FilterTag as IFilterTag, FilterMode } from "@/types/word";
import { CONSONNES, VOYELLES } from "@/data/phonemes";
import { Ear, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

interface PhonemeFilterProps {
    isOpen: boolean;
    onToggle: () => void;
    phonemes: IFilterTag[];
    onAddFilter: (tags: IFilterTag[]) => void;
    onRemoveFilter: (id: string) => void;
    currentPhonemes: { values: string[]; position: 'start' | 'end' | 'middle' | 'anywhere' };
    onPhonemesUpdate: (values: string[], position: 'start' | 'end' | 'middle' | 'anywhere') => void;
}

export function PhonemeFilter({ isOpen, onToggle, phonemes, onAddFilter, onRemoveFilter, currentPhonemes, onPhonemesUpdate }: PhonemeFilterProps) {
    const { values: selectedPhonemes, position } = currentPhonemes;
    const [mode, setMode] = useState<FilterMode>('include');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const isExclude = mode === 'exclude';
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        if (!isDropdownOpen) return;
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isDropdownOpen]);

    // Scroll to bottom of section when dropdown opens — ensures tags + spacing are visible
    useEffect(() => {
        if (isDropdownOpen && bottomRef.current) {
            requestAnimationFrame(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
            });
        }
    }, [isDropdownOpen]);

    const togglePhonemeSelection = (ph: string) => {
        const next = selectedPhonemes.includes(ph)
            ? selectedPhonemes.filter(p => p !== ph)
            : [...selectedPhonemes, ph];
        onPhonemesUpdate(next, position);
    };

    const handleAdd = () => {
        if (selectedPhonemes.length === 0) return;

        const newTags: IFilterTag[] = selectedPhonemes.map(ph => ({
            id: generateId(),
            value: ph,
            position,
            mode
        })).filter(newTag =>
            !phonemes.some(existing =>
                existing.value === newTag.value &&
                existing.position === newTag.position &&
                (existing.mode || 'include') === mode
            )
        );

        if (newTags.length > 0) {
            onAddFilter(newTags);
        }

        // Clear realtime after adding tags + close dropdown
        onPhonemesUpdate([], 'anywhere');
        setIsDropdownOpen(false);
    };

    // Display text for the trigger
    const triggerText = selectedPhonemes.length > 0
        ? selectedPhonemes.join(', ')
        : 'Sélectionner...';

    const dropdownId = 'phoneme-grid-dropdown';

    const renderPhonemeGrid = (list: string[]) => (
        <div className="flex flex-wrap gap-1" role="group">
            {list.map(ph => {
                const isSelected = selectedPhonemes.includes(ph);
                const existingTag = phonemes.find(t => t.value === ph);
                const isTaggedInclude = existingTag && (existingTag.mode || 'include') === 'include';
                const isTaggedExclude = existingTag?.mode === 'exclude';
                return (
                    <button
                        key={ph}
                        onClick={() => togglePhonemeSelection(ph)}
                        aria-pressed={isSelected}
                        className={cn(
                            "w-[33px] h-[30px] rounded-[6px] border-[1.5px] text-[12px] font-mono font-semibold transition-all select-none",
                            isSelected
                                ? isExclude
                                    ? "border-red-400 bg-red-50 text-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.08)] font-bold"
                                    : "border-[rgb(var(--filter-accent))] bg-[#eef2ff] text-[rgb(var(--filter-accent))] shadow-[0_0_0_2px_rgba(99,102,241,0.12)] font-bold"
                                : isTaggedExclude
                                    ? "border-red-200 bg-red-50/50 text-red-400 font-bold hover:scale-[1.08] active:scale-95"
                                    : isTaggedInclude
                                        ? "border-[#b4bffc] bg-[#eef2ff]/50 text-[rgb(var(--filter-accent))]/70 font-bold hover:scale-[1.08] active:scale-95"
                                        : isExclude
                                            ? "border-border bg-white text-muted-foreground hover:border-red-200 hover:bg-red-50 hover:text-red-500 hover:scale-[1.08] active:scale-95"
                                            : "border-border bg-white text-muted-foreground hover:border-[#b4bffc] hover:bg-[#eef2ff] hover:text-[rgb(var(--filter-accent))] hover:scale-[1.08] active:scale-95"
                        )}
                    >
                        {ph}
                    </button>
                );
            })}
        </div>
    );

    return (
        <FilterSection
            title="Phonème"
            icon={<Ear className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
            badge={phonemes.length}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="px-1 py-1 space-y-2.5" ref={containerRef}>
                {/* Input row — combobox trigger */}
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "flex-1 min-w-0 flex border-[1.5px] rounded-[9px] overflow-hidden transition-all bg-white",
                        isDropdownOpen
                            ? isExclude
                                ? "border-red-400 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                                : "border-[rgb(var(--filter-accent))] shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                            : isExclude
                                ? "border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                                : "border-border focus-within:border-[rgb(var(--filter-accent))] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                    )}>
                        <ModeToggle mode={mode} onToggle={() => setMode(m => m === 'include' ? 'exclude' : 'include')} />
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen(o => !o)}
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="dialog"
                            aria-controls={isDropdownOpen ? dropdownId : undefined}
                            className="flex-1 min-w-0 flex items-center gap-1 h-[32px] px-2.5 py-[7px] cursor-pointer select-none"
                        >
                            <span className={cn(
                                "flex-1 min-w-0 text-left truncate font-mono text-[12.5px]",
                                selectedPhonemes.length > 0
                                    ? "font-medium text-foreground"
                                    : "font-normal text-muted-foreground"
                            )}>
                                {triggerText}
                            </span>
                            <ChevronDown className={cn(
                                "w-3 h-3 text-muted-foreground shrink-0 transition-transform",
                                isDropdownOpen && "rotate-180"
                            )} />
                        </button>
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={position}
                            onChange={(e) => onPhonemesUpdate(selectedPhonemes, e.target.value as any)}
                            className={cn(
                                "appearance-none h-[32px] pl-2 pr-5 bg-white border-[1.5px] rounded-[7px] text-[11px] font-semibold font-['DM_Sans'] text-muted-foreground focus:outline-none cursor-pointer transition-all",
                                isExclude
                                    ? "border-red-200 focus:border-red-400"
                                    : "border-border focus:border-[rgb(var(--filter-accent))]"
                            )}
                        >
                            <option value="anywhere">Partout</option>
                            <option value="start">Début</option>
                            <option value="middle">Milieu</option>
                            <option value="end">Fin</option>
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={selectedPhonemes.length === 0}
                        className={cn(
                            "w-[32px] h-[32px] shrink-0 text-white rounded-[8px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                            isExclude
                                ? "bg-red-500 hover:bg-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.2)]"
                                : "bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca] shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* Dropdown — IPA grid */}
                {isDropdownOpen && (
                    <div id={dropdownId} role="dialog" className={cn(
                        "rounded-[10px] border-[1.5px] p-2.5 pt-2 animate-in fade-in slide-in-from-top-1 duration-150",
                        isExclude
                            ? "border-red-200 bg-gradient-to-b from-red-50/30 to-[#f8f9fc]"
                            : "border-[#eef0f5] bg-[#f8f9fc]"
                    )}>
                        <div className="mb-1.5">
                            <div className="text-[7.5px] font-['Sora'] font-bold text-muted-foreground uppercase tracking-[0.8px] mb-1">
                                Consonnes
                            </div>
                            {renderPhonemeGrid(CONSONNES)}
                        </div>
                        <div>
                            <div className="text-[7.5px] font-['Sora'] font-bold text-muted-foreground uppercase tracking-[0.8px] mb-1">
                                Voyelles
                            </div>
                            {renderPhonemeGrid(VOYELLES)}
                        </div>
                    </div>
                )}

                {/* Tags */}
                {phonemes.length > 0 && (
                    <div className="flex flex-wrap gap-[5px]">
                        {phonemes.map(tag => (
                            <FilterTag
                                key={tag.id}
                                tag={tag}
                                onRemove={onRemoveFilter}
                                formatLabel={(val) => `[${val}]`}
                            />
                        ))}
                    </div>
                )}

                {/* 40px bottom spacing — scroll target to ensure tags are visible */}
                {(isDropdownOpen || phonemes.length > 0) && (
                    <div ref={bottomRef} className="h-10" />
                )}
            </div>
        </FilterSection>
    );
}
