import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
            <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden bg-white rounded-xl">
                <ScrollArea className="max-h-[85vh]">
                    {/* Header avec gradient */}
                    <div
                        className="p-6 pb-4"
                        style={{
                            background: 'linear-gradient(135deg, hsl(48 100% 90%), hsl(174 50% 85%))'
                        }}
                    >
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                {word.ORTHO}
                            </DialogTitle>
                            <p className="text-base font-mono text-muted-foreground mt-1">
                                /{word.PHON}/
                            </p>
                        </DialogHeader>

                        {/* Pills */}
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            <span className="pill text-xs py-1 px-2.5 bg-white/80 backdrop-blur">
                                {SYNT_LABELS[word.SYNT] || word.SYNT}
                            </span>
                            <span className="pill text-xs py-1 px-2.5 bg-white/80 backdrop-blur font-mono">
                                {word.NBSYLL} syllabe{parseInt(word.NBSYLL) > 1 ? 's' : ''}
                            </span>
                            <span className="pill text-xs py-1 px-2.5 bg-white/80 backdrop-blur font-mono">
                                {word.NBLET} lettres
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-4 space-y-5">

                        {/* Structure */}
                        <section>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Structure syllabique
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Découpage</p>
                                    <p className="font-mono text-sm">{word.PSYLL}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Code</p>
                                    <p className="font-mono text-lg font-semibold text-primary">{word["code structure"]}</p>
                                    <p className="text-xs text-muted-foreground">{STRUCTURE_LABELS[word["code structure"]]}</p>
                                </div>
                            </div>
                        </section>

                        {/* Correspondance GP */}
                        <section>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Correspondance Graphème-Phonème
                            </h3>
                            <div className="space-y-2">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Graphèmes</p>
                                    <p className="font-mono text-sm break-all">{word.GSEG}</p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Phonèmes</p>
                                    <p className="font-mono text-sm break-all">{word.PSEG}</p>
                                </div>
                            </div>
                        </section>

                        {/* Complexité */}
                        <section>
                            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                                Niveaux
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Complexité</p>
                                    <p className="font-mono text-xl font-bold text-primary">{word["code graphèmes"]}</p>
                                    <p className="text-xs text-muted-foreground truncate" title={GRAPHEME_LABELS[word["code graphèmes"]]}>
                                        {GRAPHEME_LABELS[word["code graphèmes"]]}
                                    </p>
                                </div>
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Fréquence</p>
                                    <p className="font-mono text-xl font-bold">{frequency.toFixed(1)}</p>
                                    {codeFreq && (
                                        <p className="text-xs text-muted-foreground">{FREQUENCY_LABELS[codeFreq]}</p>
                                    )}
                                </div>
                            </div>
                        </section>

                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
