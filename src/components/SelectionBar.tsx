import { Button } from "@/components/ui/button";
import { useSelection } from "@/contexts/SelectionContext";
import { X, Download, Trash2 } from "lucide-react";

export function SelectionBar() {
    const { selectedWords, clearSelection } = useSelection();

    if (selectedWords.length === 0) return null;

    return (
        <div className="sticky top-4 z-50 flex justify-center mb-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 min-w-[320px] justify-between border border-border/20">

                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {selectedWords.length}
                    </div>
                    <span className="text-sm font-medium">
                        {selectedWords.length} mot{selectedWords.length > 1 ? 's' : ''} sélectionné{selectedWords.length > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8 px-3 text-muted/80 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Vider
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full font-semibold"
                        onClick={() => alert(`Export de ${selectedWords.length} mots (Fonctionnalité à venir)`)}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                    </Button>
                </div>
            </div>
        </div>
    );
}
