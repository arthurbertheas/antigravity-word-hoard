import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useSelection } from "@/contexts/SelectionContext";
import { X, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SelectionBar() {
    const { selectedWords, clearSelection } = useSelection();
    const [isDocked, setIsDocked] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Hide internal bar if in iframe (Webflow takes over via Bridge)
    // NOTE: User requested this logic to be active, so we might need to adjust this check if the "smart behavior" is strictly for the standalone/iframe version managed here.
    // Assuming for now we keep the check but the logic applies when this component IS rendered.
    if (typeof window !== 'undefined' && window.self !== window.top) {
        // if user wants this INSIDE the iframe, we should remove this return null.
        // The prompt implies "Webflow-integrated iframe", so this logic likely runs INSIDE the iframe.
        // If this check prevents rendering, nothing shows up.
        // PREVIOUSLY: logic was to hide it if in iframe? 
        // Thread context: "Dans notre configuration (iframe qui s'agrandit toute seule)..."
        // If I keep this check, it returns null in the iframe.
        // Removing the check to ensure it works in the iframe as requested.
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsDocked(entry.isIntersecting);
            },
            {
                root: null, // viewport
                threshold: 0.1, // trigger when 10% of the sentinel is visible
            }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [selectedWords.length]); // Re-bind if visibility changes

    if (selectedWords.length === 0) return null;

    return (
        /* Sentinel / Anchor container - Always in the flow at the bottom */
        <div
            ref={sentinelRef}
            className="w-full h-20 mt-8 flex justify-center items-end" // Reserve space
        >
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                isDocked
                    ? "relative transform-none" // Docked state (at bottom of flow)
                    : "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 shadow-xl" // Floating state
            )}>
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
        </div>
    );
}
