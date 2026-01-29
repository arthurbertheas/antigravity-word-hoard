import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Word, SYNT_LABELS, STRUCTURE_LABELS, GRAPHEME_LABELS } from "@/types/word";

interface WordDetailPanelProps {
    word: Word | null;
    onClose: () => void;
}

export function WordDetailPanel({ word, onClose }: WordDetailPanelProps) {
    if (!word) return null;

    const frequency = parseFloat(word["fréquence"].replace(',', '.'));

    return (
        <div className="h-[calc(100vh-8rem)] sticky top-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
            {/* Header Fixe */}
            <div className="p-6 pb-4 border-b">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-primary tracking-tight leading-none">
                            {word.ORTHO}
                        </h2>
                        <p className="text-lg font-mono text-muted-foreground mt-1">
                            /{word.PHON}/
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
                        {SYNT_LABELS[word.SYNT] || word.SYNT}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                        {word.NBSYLL} syll.
                    </Badge>
                </div>
            </div>

            {/* Contenu Scrollable */}
            <ScrollArea className="flex-1">
                <div className="p-6 space-y-8">

                    {/* Structure */}
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Structure
                        </h3>
                        <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs text-muted-foreground">Découpage</span>
                                <span className="font-mono text-base font-medium">{word.PSYLL}</span>
                            </div>
                            <Separator className="my-2 opacity-50" />
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Type</span>
                                <span className="text-xs text-right text-foreground/80 leading-tight">
                                    {STRUCTURE_LABELS[word["code structure"]]}
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Graphie */}
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Graphie
                        </h3>
                        <div className="bg-muted/30 rounded-lg p-3 border border-border/50 space-y-3">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs text-muted-foreground">Complexité</span>
                                    <span className="font-bold text-primary">{word["code graphèmes"]}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    {GRAPHEME_LABELS[word["code graphèmes"]]}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 bg-background/50 p-2 rounded border border-border/20">
                                <div className="text-center">
                                    <span className="block text-[10px] text-muted-foreground uppercase">Lettres</span>
                                    <span className="font-mono text-sm font-medium">{word.NBLET}</span>
                                </div>
                                <div className="text-center border-l border-border/20">
                                    <span className="block text-[10px] text-muted-foreground uppercase">Phonèmes</span>
                                    <span className="font-mono text-sm font-medium">{word.NBPHON}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Fréquence */}
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Fréquence
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-muted-foreground">Indice Manulex</span>
                                <span className="font-mono text-base font-bold text-accent">{frequency.toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full"
                                    style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
