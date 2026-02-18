import { useState } from "react";
import { FilterSection } from "./FilterSection";
import { FilterTag } from "./FilterTag";
import { ModeToggle } from "./ModeToggle";
import { FilterTag as IFilterTag, FilterMode } from "@/types/word";
import { Search, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

interface SearchFilterProps {
    isOpen: boolean;
    onToggle: () => void;
    searchTags: IFilterTag[];
    onAddFilter: (tag: IFilterTag) => void;
    onRemoveFilter: (id: string) => void;
    currentSearch: { value: string; position: 'start' | 'end' | 'middle' | 'anywhere' };
    onSearchUpdate: (value: string, position: 'start' | 'end' | 'middle' | 'anywhere') => void;
}

export function SearchFilter({ isOpen, onToggle, searchTags, onAddFilter, onRemoveFilter, currentSearch, onSearchUpdate }: SearchFilterProps) {
    const { value: inputValue, position } = currentSearch;
    const [mode, setMode] = useState<FilterMode>('include');

    const handleAdd = () => {
        if (!inputValue.trim()) return;

        // Prevent duplicates (same value + position + mode)
        const exists = searchTags.some(s => s.value === inputValue.trim() && s.position === position && (s.mode || 'include') === mode);
        if (exists) {
            onSearchUpdate("", 'anywhere');
            return;
        }

        onAddFilter({
            id: generateId(),
            value: inputValue.trim(),
            position,
            mode
        });
        // Clear realtime search after adding tag
        onSearchUpdate("", 'anywhere');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <FilterSection
            title="Séquence de lettres"
            icon={<Search className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
            badge={searchTags.length}
            isOpen={isOpen}
            onToggle={onToggle}
            className="mb-1"
        >
            <div className="px-1 py-1 space-y-2.5">
                <div className="flex items-center gap-1.5">
                    <div className={cn(
                        "flex-1 min-w-0 flex items-center border-[1.5px] rounded-[9px] overflow-hidden transition-all bg-white",
                        mode === 'exclude'
                            ? "border-red-200 focus-within:border-red-400 focus-within:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
                            : "border-border focus-within:border-[rgb(var(--filter-accent))] focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                    )}>
                        <ModeToggle mode={mode} onToggle={() => setMode(m => m === 'include' ? 'exclude' : 'include')} />
                        <input
                            type="text"
                            placeholder="ex: bou, tion..."
                            value={inputValue}
                            onChange={(e) => onSearchUpdate(e.target.value, position)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 min-w-0 h-[32px] px-2.5 py-[7px] bg-transparent border-0 outline-none font-mono text-[12.5px] font-medium text-foreground placeholder:text-muted-foreground placeholder:font-normal"
                        />
                    </div>

                    <div className="relative shrink-0">
                        <select
                            value={position}
                            onChange={(e) => onSearchUpdate(inputValue, e.target.value as any)}
                            className="appearance-none h-[32px] pl-2 pr-5 bg-white border-[1.5px] border-border rounded-[7px] text-[11px] font-semibold font-['DM_Sans'] text-muted-foreground focus:outline-none focus:border-[rgb(var(--filter-accent))] cursor-pointer"
                        >
                            <option value="anywhere">Partout</option>
                            <option value="start">Début</option>
                            <option value="end">Fin</option>
                            <option value="middle">Milieu</option>
                        </select>
                        <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!inputValue.trim()}
                        className={cn(
                            "w-[32px] h-[32px] shrink-0 text-white rounded-[8px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all",
                            mode === 'exclude'
                                ? "bg-red-500 hover:bg-red-600 shadow-[0_2px_8px_rgba(239,68,68,0.2)]"
                                : "bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca] shadow-[0_2px_8px_rgba(99,102,241,0.25)]"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-[5px]">
                        {searchTags.map(tag => (
                            <FilterTag
                                key={tag.id}
                                tag={tag}
                                onRemove={onRemoveFilter}
                            />
                        ))}
                    </div>
                )}
            </div>
        </FilterSection>
    );
}
