import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Volume2 } from "lucide-react";
import { Word, SYNT_LABELS, STRUCTURE_LABELS, GRAPHEME_LABELS } from "@/types/word";

interface WordDetailViewProps {
    word: Word;
    onBack: () => void;
}

export function WordDetailView({ word, onBack }: WordDetailViewProps) {
    const frequency = parseFloat(word["fréquence"].replace(',', '.'));

    return (
        <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Toolbar Navigation */}
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-primary" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la liste
                </Button>
            </div>

            {/* Carte Détail Principale */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden max-w-3xl mx-auto w-full">

                {/* En-tête Hero */}
                <div className="bg-muted/30 p-8 pb-6 border-b border-border/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-baseline gap-4">
                                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-none">
                                    {word.ORTHO}
                                </h2>
                                <span className="text-2xl font-mono text-muted-foreground">
                                    /{word.PHON}/
                                </span>
                            </div>

                            <div className="flex gap-3 mt-4">
                                <Badge className="text-base px-3 py-1 bg-primary text-white hover:bg-primary/90">
                                    {SYNT_LABELS[word.SYNT] || word.SYNT}
                                </Badge>
                                <Badge variant="outline" className="text-base px-3 py-1 bg-background">
                                    {word.NBSYLL} syllabe{parseInt(word.NBSYLL) > 1 ? 's' : ''}
                                </Badge>
                            </div>
                        </div>

                        {/* Note d'Appui Lexical (Badge Circulaire) */}
                        <div className="flex flex-col items-center gap-1 bg-background p-3 rounded-xl border border-border/50 shadow-sm">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Appui</span>
                            <span className="text-2xl font-bold text-accent">{frequency.toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                {/* Contenu Détaillé */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Colonne Gauche : Structure */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-primary mb-4 uppercase tracking-wider">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                Structure Syllabique
                            </h3>
                            <div className="bg-muted/20 rounded-xl p-5 border border-border/50 hover:bg-muted/40 transition-colors">
                                <div className="mb-4">
                                    <span className="text-sm text-muted-foreground block mb-1">Découpage</span>
                                    <span className="text-3xl font-mono text-foreground tracking-wide font-medium">
                                        {word.PSYLL}
                                    </span>
                                </div>

                                <Separator className="my-4 opacity-50" />

                                <div>
                                    <span className="text-sm text-muted-foreground block mb-1">Type de structure</span>
                                    <span className="font-medium text-foreground">
                                        {STRUCTURE_LABELS[word["code structure"]] || word["code structure"]}
                                    </span>
                                    <Badge variant="secondary" className="ml-2 font-mono text-xs">
                                        {word["code structure"]}
                                    </Badge>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-primary mb-4 uppercase tracking-wider">
                                <span className="w-1 h-4 bg-primary rounded-full" />
                                Phonologie
                            </h3>
                            <div className="bg-muted/20 rounded-xl p-5 border border-border/50 grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Phonèmes</span>
                                    <span className="text-xl font-mono font-medium">{word.NBPHON}</span>
                                </div>
                                <div>
                                    <span className="text-xs text-muted-foreground block mb-1">Segmentation</span>
                                    <span className="text-sm font-mono">{word.PSEG}</span>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Colonne Droite : Graphie */}
                    <div className="space-y-6">
                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-accent mb-4 uppercase tracking-wider">
                                <span className="w-1 h-4 bg-accent rounded-full" />
                                Analyse Graphémique
                            </h3>
                            <div className="bg-muted/20 rounded-xl p-5 border border-border/50 hover:bg-muted/40 transition-colors space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm text-muted-foreground block mb-1">Complexité</span>
                                        <span className="text-lg font-medium leading-snug max-w-[250px] block">
                                            {GRAPHEME_LABELS[word["code graphèmes"]]}
                                        </span>
                                    </div>
                                    <div className="text-center bg-background rounded-lg p-2 border border-border/50 min-w-[3rem]">
                                        <span className="block text-2xl font-bold text-primary">{word["code graphèmes"]}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-background/80 p-3 rounded-lg border border-border/30">
                                        <span className="text-xs text-muted-foreground block">Lettres</span>
                                        <span className="text-xl font-mono font-medium">{word.NBLET}</span>
                                    </div>
                                    <div className="bg-background/80 p-3 rounded-lg border border-border/30">
                                        <span className="text-xs text-muted-foreground block">Graphèmes</span>
                                        <span className="text-xl font-mono font-medium">{word.NBGRAPH}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                                <span className="w-1 h-4 bg-muted-foreground rounded-full" />
                                Correspondance
                            </h3>
                            <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                <code className="block text-center font-mono text-sm bg-background p-2 rounded border border-border/30">
                                    {word.GPMATCH}
                                </code>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
