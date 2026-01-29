import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Word, SYNT_LABELS, STRUCTURE_LABELS, GRAPHEME_LABELS, FREQUENCY_LABELS } from "@/types/word";

interface WordDetailModalProps {
    word: Word | null;
    onClose: () => void;
}

export function WordDetailModal({ word, onClose }: WordDetailModalProps) {
    if (!word) return null;

    const frequency = parseFloat(word["fréquence"].replace(',', '.'));
    const codeFreq = word["code fréquence"];

    return (
        <Dialog open={!!word} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden bg-white rounded-2xl">
                <ScrollArea className="max-h-[85vh]">
                    <div className="p-6">
                        <DialogHeader className="space-y-2">
                            <DialogTitle className="text-3xl font-bold text-foreground tracking-tight">
                                {word.ORTHO}
                            </DialogTitle>
                            <p className="text-lg font-mono text-muted-foreground">
                                /{word.PHON}/
                            </p>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            {/* Badges principaux */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary text-white">
                                    {SYNT_LABELS[word.SYNT] || word.SYNT}
                                </Badge>
                                <Badge variant="outline" className="font-mono">
                                    {word.NBSYLL} syllabe{parseInt(word.NBSYLL) > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline" className="font-mono">
                                    {word.NBLET} lettres
                                </Badge>
                                <Badge variant="outline" className="font-mono">
                                    {word.NBPHON} phonèmes
                                </Badge>
                            </div>

                            <Separator />

                            {/* Informations syllabiques */}
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Structure syllabique
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Découpage</p>
                                        <p className="font-mono text-lg">{word.PSYLL}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Code structure</p>
                                        <p className="font-mono text-2xl font-bold text-primary">{word["code structure"]}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {STRUCTURE_LABELS[word["code structure"]] || 'Non défini'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Correspondance graphème-phonème */}
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Correspondance Graphème-Phonème
                                </h3>
                                <div className="space-y-2">
                                    <div className="bg-muted/50 rounded-xl p-3">
                                        <p className="text-xs text-muted-foreground mb-1">Segmentation graphémique</p>
                                        <p className="font-mono text-sm break-all">{word.GSEG}</p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-3">
                                        <p className="text-xs text-muted-foreground mb-1">Segmentation phonémique</p>
                                        <p className="font-mono text-sm break-all">{word.PSEG}</p>
                                    </div>
                                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                                        <p className="text-xs text-muted-foreground mb-1">Correspondance GP</p>
                                        <p className="font-mono text-xs break-all">{word.GPMATCH}</p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Complexité */}
                            <section>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    Niveaux de complexité
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Code graphèmes</p>
                                        <p className="font-mono text-3xl font-bold text-primary">{word["code graphèmes"]}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {GRAPHEME_LABELS[word["code graphèmes"]] || 'Non défini'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/50 rounded-xl p-4">
                                        <p className="text-xs text-muted-foreground mb-1">Fréquence</p>
                                        <p className="font-mono text-3xl font-bold text-accent">{frequency.toFixed(1)}</p>
                                        {codeFreq && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {FREQUENCY_LABELS[codeFreq] || `Code ${codeFreq}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Indicateur de fréquence */}
                            <div className="bg-muted/50 rounded-xl p-4">
                                <p className="text-xs text-muted-foreground mb-2">Fréquence relative</p>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
                                        style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                                    <span>Rare</span>
                                    <span>Fréquent</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
