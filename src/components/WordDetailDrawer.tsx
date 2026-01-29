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

    const frequency = parseFloat(word["fréquence"].replace(',', '.'));
    const codeFreq = word["code fréquence"];

    return (
        <Sheet open={!!word} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-md w-full p-0 overflow-hidden bg-white/95 backdrop-blur-sm">
                <ScrollArea className="h-full">
                    <div className="p-6 pb-20">
                        <SheetHeader className="space-y-4 mb-8 text-left">
                            <div>
                                <SheetTitle className="text-4xl font-bold text-primary tracking-tight leading-none">
                                    {word.ORTHO}
                                </SheetTitle>
                                <SheetDescription className="text-xl font-mono text-muted-foreground mt-2">
                                    /{word.PHON}/
                                </SheetDescription>
                            </div>

                            {/* Badges principaux en header */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                    {SYNT_LABELS[word.SYNT] || word.SYNT}
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
                                            <span className="font-mono text-lg font-medium text-foreground">{word.PSYLL}</span>
                                        </div>
                                        <Separator className="my-3 opacity-50" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Structure</span>
                                            <Badge variant="secondary" className="font-mono text-xs">
                                                {word["code structure"]}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 italic">
                                            {STRUCTURE_LABELS[word["code structure"]] || 'Non défini'}
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
                                        <span className="font-bold text-lg text-primary">{word["code graphèmes"]}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground bg-white/50 p-2 rounded">
                                        {GRAPHEME_LABELS[word["code graphèmes"]] || 'Non défini'}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <div className="bg-white/60 p-2 rounded text-center">
                                            <span className="block text-xs text-muted-foreground mb-1">Graphèmes</span>
                                            <span className="font-mono text-sm font-medium">{word.NBGRAPH}</span>
                                        </div>
                                        <div className="bg-white/60 p-2 rounded text-center">
                                            <span className="block text-xs text-muted-foreground mb-1">Phonèmes</span>
                                            <span className="font-mono text-sm font-medium">{word.NBPHON}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Fréquence */}
                            <section className="space-y-3">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Fréquence d'usage
                                </h3>
                                <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-sm text-muted-foreground">Indice</span>
                                        <span className="font-mono text-xl font-bold">{frequency.toFixed(1)}</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                                        />
                                    </div>
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
                                    <div className="grid grid-cols-3 divide-x divide-border/50 text-center">
                                        <div className="p-2">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Graph.</div>
                                            <div className="font-mono text-xs">{word.GSEG}</div>
                                        </div>
                                        <div className="p-2">
                                            <div className="text-[10px] uppercase text-muted-foreground mb-1">Phon.</div>
                                            <div className="font-mono text-xs">{word.PSEG}</div>
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
