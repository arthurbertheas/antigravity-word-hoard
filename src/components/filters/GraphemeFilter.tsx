import { FilterSection } from "./FilterSection";
import { FilterTag } from "./FilterTag";
import { FilterTag as IFilterTag } from "@/types/word";
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

    const handleAdd = () => {
        if (!inputValue.trim()) return;

        // Prevent duplicates
        const exists = graphemes.some(g => g.value === inputValue.trim() && g.position === position);
        if (exists) {
            onGraphemeUpdate("", 'anywhere');
            return;
        }

        onAddFilter({
            id: generateId(),
            value: inputValue.trim(),
            position
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
                    <Input
                        value={inputValue}
                        onChange={(e) => onGraphemeUpdate(e.target.value, position)}
                        onKeyDown={handleKeyDown}
                        placeholder="ex: ein..."
                        className="flex-1 h-[32px] text-[13px] font-mono px-3 py-[7px] border-border rounded-lg placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-[rgba(79,70,229,0.1)] focus-visible:border-[rgb(var(--filter-accent))]"
                    />

                    {/* Position Select Custom (Simplified as native select with styling for MVP, or custom UI) */}
                    {/* Using a styled native select for reliability/speed matching the mockup logic */}
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
                        className="h-[32px] px-3 bg-[rgb(var(--filter-accent))] hover:bg-[#4338ca] text-white rounded-[7px] flex items-center justify-center shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
