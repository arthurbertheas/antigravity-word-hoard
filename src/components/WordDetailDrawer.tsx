import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Word, SYNT_LABELS, STRUCTURE_LABELS, GRAPHEME_LABELS, FREQUENCY_LABELS } from "@/types/word";

interface WordDetailDrawerProps {
    word: Word | null;
    onClose: () => void;
}

export function WordDetailDrawer({ word, onClose }: WordDetailDrawerProps) {
    if (!word) return null;

    const codeFreq = word["APPUI LEXICAL"];
    const codeFreqNum = parseInt(codeFreq || "0", 10);

    return (
        <Sheet open={!!word} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md w-full p-0 overflow-hidden bg-white/95 backdrop-blur-sm">
                <ScrollArea className="h-full">
                    <div className="p-6 pb-20">
                        <SheetHeader className="space-y-4 mb-8 text-left">
                            <div>
                                <SheetTitle className="text-4xl font-bold text-primary tracking-tight leading-none">
                                    {word.MOTS}
                                </SheetTitle>
                                <SheetDescription className="text-xl font-mono text-muted-foreground mt-2">
                                    /{word.PHONEMES}/
                                </SheetDescription>
                            </div>

                            {/* Badges principaux en header */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                    {SYNT_LABELS[word.SYNT as any] || word.SYNT}
                                </Badge>
                                <Badge variant="outline" className="font-mono bg-white/50">
                                    {word.NBSYLL} syll.
                                </Badge>
                            </div>
                        </SheetHeader>

                        <div className="space-y-8">
                            {/* Informations syllabiques */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Structure Syllabique
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-sm text-muted-foreground">Découpage</span>
                                            <span className="font-mono text-lg font-medium text-foreground">{word["segmentation syllabique"]}</span>
                                        </div>
                                        <Separator className="my-3 opacity-50" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Structure</span>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {word["progression structure"]}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            {STRUCTURE_LABELS[word["progression structure"]] || word["progression structure"] || 'Non défini'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Complexité */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Analyse Graphémique
                                </h3>
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/50 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Complexité</span>
                                        <span className="font-bold text-lg text-primary">{word["progression graphèmes"]}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                                        {GRAPHEME_LABELS[word["progression graphèmes"]] || word["progression graphèmes"] || 'Non défini'}
                                    </p>

                                    <div className="grid grid-cols-1 gap-2 pt-2">
                                        <div className="bg-white/60 p-2 rounded text-center">
                                            <span className="block text-xs text-muted-foreground mb-1">Nombre de lettres</span>
                                            <span className="font-mono text-sm font-medium">{word.MOTS.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Code appui lexical */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Code appui lexical
                                </h3>
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm text-muted-foreground">Appui lexical</span>
                                        <span className="font-mono text-xl font-bold">{codeFreq || '-'}</span>
                                    </div>
                                    {codeFreqNum > 0 && (
                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                                            <div
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${(codeFreqNum / 4) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wide">
                                        <span>Rare</span>
                                        <span>Fréquent</span>
                                    </div>
                                </div>
                            </section>

                            {/* Correspondance */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Correspondance
                                </h3>
                                <div className="bg-muted/30 rounded-lg p-2 border border-border/50">
                                    <div className="grid grid-cols-2 divide-x divide-border/50 text-center">
                                        <div className="p-2">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Graph.</div>
                                            <div className="font-mono text-xs">{word["segmentation graphèmes"]}</div>
                                        </div>
                                        <div className="p-2">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Match</div>
                                            <div className="font-mono text-xs">{word.GPMATCH}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
