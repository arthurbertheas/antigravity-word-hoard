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
import { BookOpen, Hash, Layers, BarChart3, Zap } from "lucide-react";

interface WordDetailModalProps {
    word: Word | null;
    onClose: () => void;
}

export function WordDetailModal({ word, onClose }: WordDetailModalProps) {
    if (!word) return null;

    const frequency = parseFloat(word["fréquence"].replace(',', '.'));
    const codeFreq = word["code fréquence"];
    const codeGrapheme = parseInt(word["code graphèmes"], 10);

    return (
        <Dialog open={!!word} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden glass border-border/30">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

                <ScrollArea className="max-h-[90vh]">
                    <div className="relative p-8">
                        <DialogHeader className="space-y-4">
                            {/* Word display */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <DialogTitle className="text-4xl font-bold gradient-text tracking-tight">
                                        {word.ORTHO}
                                    </DialogTitle>
                                    <p className="text-xl font-mono text-muted-foreground mt-2 tracking-wide">
                                        /{word.PHON}/
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-5xl font-bold font-mono text-primary/30">
                                        {word["code graphèmes"]}
                                    </span>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="mt-8 space-y-8">
                            {/* Badges principaux */}
                            <div className="flex flex-wrap gap-2">
                                <Badge className="text-sm bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                                    {SYNT_LABELS[word.SYNT] || word.SYNT}
                                </Badge>
                                <Badge variant="outline" className="text-sm font-mono border-border/50">
                                    {word.NBSYLL} syllabe{parseInt(word.NBSYLL) > 1 ? 's' : ''}
                                </Badge>
                                <Badge variant="outline" className="text-sm font-mono border-border/50">
                                    {word.NBLET} lettres
                                </Badge>
                                <Badge variant="outline" className="text-sm font-mono border-border/50">
                                    {word.NBPHON} phonèmes
                                </Badge>
                                <Badge variant="outline" className="text-sm font-mono border-border/50">
                                    {word.NBGRAPH} graphèmes
                                </Badge>
                            </div>

                            <Separator className="bg-border/30" />

                            {/* Informations syllabiques */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Hash className="w-5 h-5 text-secondary" />
                                    Structure syllabique
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/30 hover:border-secondary/30 transition-colors">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Découpage phonétique</p>
                                        <p className="font-mono text-xl text-foreground tracking-wider">{word.PSYLL}</p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/30 hover:border-accent/30 transition-colors">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Code structure</p>
                                        <p className="font-mono text-3xl font-bold text-accent">{word["code structure"]}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {STRUCTURE_LABELS[word["code structure"]] || 'Non défini'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-border/30" />

                            {/* Correspondance graphème-phonème */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Correspondance Graphème-Phonème
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Segmentation graphémique</p>
                                        <p className="font-mono text-sm break-all text-foreground/80">{word.GSEG}</p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Segmentation phonémique</p>
                                        <p className="font-mono text-sm break-all text-foreground/80">{word.PSEG}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Correspondance GP</p>
                                        <p className="font-mono text-xs break-all text-foreground/70">{word.GPMATCH}</p>
                                    </div>
                                </div>
                            </section>

                            <Separator className="bg-border/30" />

                            {/* Complexité */}
                            <section>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                                    Niveaux de complexité
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/30 hover:border-emerald-400/30 transition-colors">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Code graphèmes</p>
                                        <p className="font-mono text-4xl font-bold text-emerald-400">{word["code graphèmes"]}</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {GRAPHEME_LABELS[word["code graphèmes"]] || 'Non défini'}
                                        </p>
                                    </div>
                                    <div className="bg-muted/20 rounded-xl p-5 border border-border/30 hover:border-rose-400/30 transition-colors">
                                        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Fréquence d'usage</p>
                                        <p className="font-mono text-4xl font-bold text-rose-400">{frequency.toFixed(1)}</p>
                                        {codeFreq && (
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {FREQUENCY_LABELS[codeFreq] || `Code ${codeFreq}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Indicateur de fréquence visuel */}
                            <div className="bg-muted/20 rounded-xl p-5 border border-border/30">
                                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Fréquence relative</p>
                                <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-700 animate-pulse-glow"
                                        style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-muted-foreground font-mono">
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
