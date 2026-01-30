import { Button } from "@/components/ui/button";
import { useSelection } from "@/contexts/SelectionContext";
import { X, Download, Trash2, Play } from "lucide-react";

interface SelectionBarProps {
    onLaunchSlideshow?: () => void;
}

export function SelectionBar({ onLaunchSlideshow }: SelectionBarProps) {
    const { selectedWords, clearSelection } = useSelection();

    // Hide internal bar if in iframe (Webflow takes over via Bridge)
    if (typeof window !== 'undefined' && window.self !== window.top) {
        return null;
    }

    if (selectedWords.length === 0) return null;

    return (
        <div className="sticky bottom-6 z-40 flex justify-center h-0 overflow-visible pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-foreground text-background rounded-full shadow-2xl px-6 py-3 flex items-center gap-6 min-w-[320px] justify-between border border-border/20 pointer-events-auto -translate-y-[calc(100%+24px)]">

                <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {selectedWords.length}
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                        {selectedWords.length} mot{selectedWords.length > 1 ? 's' : ''}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                        className="h-8 px-2 text-muted/80 hover:text-white hover:bg-white/10 rounded-full"
                        title="Vider la sélection"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="h-4 w-px bg-white/20 mx-1"></div>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full font-semibold px-4 text-foreground hover:bg-white/90"
                        onClick={() => {
                            if (onLaunchSlideshow) {
                                onLaunchSlideshow();
                            } else {
                                alert("Fonctionnalité en cours de développement");
                            }
                        }}
                    >
                        <Play className="w-4 h-4 mr-2 fill-current" />
                        Lancer
                    </Button>
                </div>
            </div>
        </div>
    );
}
