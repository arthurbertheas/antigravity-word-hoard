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

    const codeFreq = word["APPUI LEXICAL"];
    const codeFreqNum = parseInt(codeFreq || "0", 10);

    return (
        <div className="h-[calc(100vh-8rem)] sticky top-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col">
            {/* Header Fixe */}
            <div className="p-6 pb-4 border-b">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-primary tracking-tight leading-none">
                            {word.MOTS}
                        </h2>
                        <p className="text-lg font-mono text-muted-foreground mt-1">
                            /{word.PHONEMES}/
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent">
                        {SYNT_LABELS[word.SYNT as any] || word.SYNT}
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
                                <span className="font-mono text-base font-medium">{word["segmentation syllabique"]}</span>
                            </div>
                            <Separator className="my-2 opacity-50" />
                            <div className="flex justify-between items-start gap-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">Type</span>
                                <span className="text-xs text-right text-foreground/80 leading-tight">
                                    {STRUCTURE_LABELS[word["progression structure"]] || word["progression structure"]}
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
                                    <span className="font-bold text-primary">{word["progression graphèmes"]}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug">
                                    {GRAPHEME_LABELS[word["progression graphèmes"]]}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-2 bg-background/50 p-2 rounded border border-border/20">
                                <div className="text-center">
                                    <span className="block text-[10px] text-muted-foreground uppercase">Nombre de lettres</span>
                                    <span className="font-mono text-sm font-medium">{word.MOTS.length}</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Code appui lexical */}
                    <section className="space-y-3">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Code appui lexical
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs text-muted-foreground">Appui lexical</span>
                                <span className="font-mono text-base font-bold text-accent">{codeFreq || '-'}</span>
                            </div>
                            {codeFreqNum > 0 && (
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent rounded-full"
                                        style={{ width: `${(codeFreqNum / 4) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </ScrollArea>
        </div>
    );
}
