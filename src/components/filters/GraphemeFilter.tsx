import { useState } from "react";
import { FilterSection } from "./FilterSection";
import { FilterTag } from "./FilterTag";
import { ModeToggle } from "./ModeToggle";
import { FilterTag as IFilterTag, FilterMode } from "@/types/word";
import { Pencil, Plus, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function generateId() {
    return Math.random().toString(36).substring(2, 9);
}

interface GraphemeFilterProps {
    isOpen: boolean;
    onToggle: () => void;
    graphemes: IFilterTag[];
    onAddFilter: (tag: IFilterTag) => void;
    onRemoveFilter: (id: string) => void;
    currentGrapheme: { value: string; position: 'start' | 'end' | 'middle' | 'anywhere' };
    onGraphemeUpdate: (value: string, position: 'start' | 'end' | 'middle' | 'anywhere') => void;
}

export function GraphemeFilter({ isOpen, onToggle, graphemes, onAddFilter, onRemoveFilter, currentGrapheme, onGraphemeUpdate }: GraphemeFilterProps) {
    const { value: inputValue, position } = currentGrapheme;
    const [mode, setMode] = useState<FilterMode>('include');

    const handleAdd = () => {
        if (!inputValue.trim()) return;

        // Prevent duplicates (same value + position + mode)
        const exists = graphemes.some(g => g.value === inputValue.trim() && g.position === position && (g.mode || 'include') === mode);
        if (exists) {
            onGraphemeUpdate("", 'anywhere');
            return;
        }

        onAddFilter({
            id: generateId(),
            value: inputValue.trim(),
            position,
            mode
        });
        // Clear realtime after adding tag
        onGraphemeUpdate("", 'anywhere');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <FilterSection
            title="Graphème"
            icon={<Pencil className="w-3.5 h-3.5 text-[rgb(var(--filter-accent))]" />}
            badge={graphemes.length}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="px-1 py-1">
                {/* Input Row */}
                <div className="flex gap-2 mb-2">
                    <div className={cn(
                        "flex-1 flex items-center border rounded-[7px] overflow-hidden transition-colors",
                        mode === 'exclude'
                            ? "border-red-200 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-100"
                            : "border-border focus-within:border-[rgb(var(--filter-accent))] focus-within:ring-1 focus-within:ring-[rgba(79,70,229,0.1)]"
                    )}>
                        <ModeToggle mode={mode} onToggle={() => setMode(m => m === 'include' ? 'exclude' : 'include')} />
                        <Input
                            value={inputValue}
                            onChange={(e) => onGraphemeUpdate(e.target.value, position)}
                            onKeyDown={handleKeyDown}
                            placeholder="ex: ein..."
                            className="flex-1 h-[32px] text-[13px] font-mono px-3 py-[7px] border-0 shadow-none placeholder:text-muted-foreground focus-visible:ring-0"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={position}
                            onChange={(e) => onGraphemeUpdate(inputValue, e.target.value as any)}
                            className="appearance-none h-[32px] pl-3 pr-7 bg-white border border-border rounded-[7px] text-[12px] font-medium font-['DM_Sans'] text-foreground focus:outline-none focus:border-[rgb(var(--filter-accent))] cursor-pointer"
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
                        disabled={!inputValue.trim()}
                        className={cn(
                            "h-[32px] px-3 text-white rounded-[7px] flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                            mode === 'exclude'
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca]"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        <span className="sr-only">Ajouter</span>
                    </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-[5px] min-h-[5px]">
                    {graphemes.map(tag => (
                        <FilterTag
                            key={tag.id}
                            tag={tag}
                            onRemove={onRemoveFilter}
                        />
                    ))}
                </div>
            </div>
        </FilterSection>
    );
}
