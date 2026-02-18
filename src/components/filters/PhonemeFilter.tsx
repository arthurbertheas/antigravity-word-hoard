import { useState } from "react";
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
    const isExclude = mode === 'exclude';

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

        // Clear realtime after adding tags
        onPhonemesUpdate([], 'anywhere');
    };

    // Phonemes already added as tags
    const taggedPhonemes = new Set(phonemes.map(t => t.value));

    const renderPhonemeGrid = (list: string[]) => (
        <div className="flex flex-wrap gap-[5px]">
            {list.map(ph => {
                const isSelected = selectedPhonemes.includes(ph);
                const isTagged = taggedPhonemes.has(ph);
                return (
                    <button
                        key={ph}
                        onClick={() => togglePhonemeSelection(ph)}
                        className={cn(
                            "min-w-[32px] h-[28px] px-2.5 rounded-[7px] text-[12px] font-mono font-medium border transition-all",
                            isSelected
                                ? isExclude
                                    ? "bg-red-50 border-red-400 text-red-500 font-semibold"
                                    : "bg-[rgba(79,70,229,0.1)] border-[rgb(var(--filter-accent))] text-[rgb(var(--filter-accent))] font-semibold"
                                : isTagged
                                    ? "bg-[rgba(79,70,229,0.06)] border-[rgba(79,70,229,0.3)] text-[rgb(var(--filter-accent))] font-semibold"
                                    : isExclude
                                        ? "bg-white border-border text-foreground hover:bg-red-50/50 hover:border-red-300"
                                        : "bg-white border-border text-foreground hover:bg-[rgba(79,70,229,0.04)] hover:border-[rgba(79,70,229,0.35)]"
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
            <div className="px-1 py-1 space-y-3">
                {/* Consonnes */}
                <div>
                    <div className="text-[11px] font-['Sora'] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Consonnes
                    </div>
                    {renderPhonemeGrid(CONSONNES)}
                </div>

                {/* Voyelles */}
                <div>
                    <div className="text-[11px] font-['Sora'] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Voyelles
                    </div>
                    {renderPhonemeGrid(VOYELLES)}
                </div>

                {/* Controls */}
                <div className="flex gap-2">
                    <div className={cn(
                        "flex items-center border rounded-[7px] overflow-hidden transition-colors",
                        isExclude
                            ? "border-red-200"
                            : "border-border"
                    )}>
                        <ModeToggle mode={mode} onToggle={() => setMode(m => m === 'include' ? 'exclude' : 'include')} />
                    </div>

                    <div className="relative flex-1">
                        <select
                            value={position}
                            onChange={(e) => onPhonemesUpdate(selectedPhonemes, e.target.value as any)}
                            className="w-full appearance-none h-[32px] pl-3 pr-7 bg-white border border-border rounded-[7px] text-[12px] font-medium font-['DM_Sans'] text-foreground focus:outline-none focus:border-[rgb(var(--filter-accent))] cursor-pointer"
                        >
                            <option value="anywhere">Partout</option>
                            <option value="start">Début</option>
                            <option value="end">Fin</option>
                            <option value="middle">Milieu</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={selectedPhonemes.length === 0}
                        className={cn(
                            "h-[32px] px-3 text-white rounded-[7px] flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                            isExclude
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca]"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="sr-only">Ajouter</span>
                    </button>
                </div>

                {/* Selected Tags */}
                {phonemes.length > 0 && (
                    <div className="flex flex-wrap gap-[5px] pt-1">
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
            </div>
        </FilterSection>
    );
}
