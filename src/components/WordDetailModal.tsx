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
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
                <ScrollArea className="max-h-[90vh]">
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-bold gradient-text">
                                {word.ORTHO}
                            </DialogTitle>
                            <p className="text-xl font-mono text-muted-foreground">
                                /{word.PHON}/
                            </p>
                        </DialogHeader>

                        <div className="mt-6 space-y-6">
                            {/* Badges principaux */}
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="default" className="text-sm">
                                    {SYNT_LABELS[word.SYNT] || word.SYNT}
                                </Badge>
                                <Badge variant="secondary" className="text-sm">
                                    {word.NBSYLL} syllabe{parseInt(word.NBSYLL) > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="secondary" className="text-sm">
                                    {word.NBLET} lettres
                                </Badge>
                                <Badge variant="secondary" className="text-sm">
                                    {word.NBPHON} phonèmes
                                </Badge>
                                <Badge variant="secondary" className="text-sm">
                                    {word.NBGRAPH} graphèmes
                                </Badge>
                            </div>

                            <Separator />

                            {/* Informations syllabiques */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Structure syllabique</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Découpage phonétique</p>
                                        <p className="font-mono text-lg">{word.PSYLL}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Code structure</p>
                                        <p className="font-mono text-lg font-bold">{word["code structure"]}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {STRUCTURE_LABELS[word["code structure"]] || 'Non défini'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Correspondance graphème-phonème */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Correspondance Graphème-Phonème</h3>
                                <div className="space-y-3">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Segmentation graphémique</p>
                                        <p className="font-mono break-all">{word.GSEG}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Segmentation phonémique</p>
                                        <p className="font-mono break-all">{word.PSEG}</p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Correspondance GP</p>
                                        <p className="font-mono text-sm break-all">{word.GPMATCH}</p>
                                    </div>
                                </div>
                            </section>

                            <Separator />

                            {/* Complexité */}
                            <section>
                                <h3 className="text-lg font-semibold mb-3">Niveaux de complexité</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Code graphèmes</p>
                                        <p className="font-mono text-2xl font-bold text-primary">{word["code graphèmes"]}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {GRAPHEME_LABELS[word["code graphèmes"]] || 'Non défini'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-4">
                                        <p className="text-sm text-muted-foreground mb-1">Fréquence d'usage</p>
                                        <p className="font-mono text-2xl font-bold text-primary">{frequency.toFixed(2)}</p>
                                        {codeFreq && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {FREQUENCY_LABELS[codeFreq] || `Code ${codeFreq}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Indicateur de fréquence */}
                            <div className="bg-muted/30 rounded-lg p-4">
                                <p className="text-sm text-muted-foreground mb-2">Fréquence relative</p>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary/50 via-primary to-primary/80 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
