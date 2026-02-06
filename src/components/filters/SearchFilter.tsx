import { useState } from "react";
import { FilterSection } from "./FilterSection";
import { FilterTag } from "./FilterTag";
import { FilterTag as IFilterTag } from "@/types/word";
import { Search, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    // We use local state for input to allow immediate UI feedback, but we also sync with parent
    // actually, if we want realtime, we should control the input via currentSearch OR
    // just fire onSearchUpdate. Let's make it controlled by parent to be safe, 
    // or keep local state and useEffect?
    // Let's rely on props for true SSOT.

    // BUT: existing code uses `inputValue` state.
    // We will keep `inputValue` for the text, and `position` for the select.
    // And we will trigger `onSearchUpdate` whenever they change.

    // Wait, if we use local state, we need to sync it with props? 
    // Usually yes. But here `currentSearch` comes from filters which are updated by `onSearchUpdate`.
    // So making it fully controlled is cleaner. but `SearchFilter` was designed as uncontrolled-ish before adding.

    // Let's make it controlled.

    const { value: inputValue, position } = currentSearch;

    const handleAdd = () => {
        if (!inputValue.trim()) return;

        onAddFilter({
            id: generateId(),
            value: inputValue.trim(),
            position
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
            title="Recherche"
            icon={<Search className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
            badge={searchTags.length}
            isOpen={isOpen}
            onToggle={onToggle}
            className="mb-1"
        >
            <div className="px-1 py-1 space-y-3">
                <div className="flex gap-2">
                    <Input
                        type="text"
                        placeholder="ex: bou, tion, chat..."
                        value={inputValue}
                        onChange={(e) => onSearchUpdate(e.target.value, position)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 bg-white border-border text-[13px] h-[32px] placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-[rgb(var(--filter-accent))]"
                    />

                    <div className="relative w-[85px]">
                        <select
                            value={position}
                            onChange={(e) => onSearchUpdate(inputValue, e.target.value as any)}
                            className="w-full appearance-none h-[32px] pl-2 pr-6 bg-white border border-border rounded-md text-[12px] font-medium font-['DM_Sans'] text-foreground focus:outline-none focus:border-[rgb(var(--filter-accent))] cursor-pointer truncate"
                        >
                            <option value="anywhere">Partout</option>
                            <option value="start">Début</option>
                            <option value="end">Fin</option>
                            <option value="middle">Milieu</option>
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                    </div>

                    <button
                        onClick={handleAdd}
                        disabled={!inputValue.trim()}
                        className="h-[32px] px-3 bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca] text-white rounded-md flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {searchTags.length > 0 && (
                    <div className="flex flex-wrap gap-[5px] pt-1">
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
