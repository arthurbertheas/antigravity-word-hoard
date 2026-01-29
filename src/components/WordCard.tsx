import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Word, SYNT_LABELS } from "@/types/word";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    const syntLabel = SYNT_LABELS[word.SYNT] || word.SYNT;
    const frequency = parseFloat(word["fréquence"].replace(',', '.'));

    return (
        <Card
            className="
        group cursor-pointer relative overflow-hidden
        bg-white border border-border rounded-2xl
        transition-all duration-200 ease-out
        hover-lift hover:border-primary/30
        shadow-sm hover:shadow-md
      "
            onClick={() => onClick?.(word)}
        >
            <CardContent className="p-5">
                {/* Complexity badge */}
                <div className="absolute top-4 right-4">
                    <span className="text-xs font-mono text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full">
                        {word["code graphèmes"]}
                    </span>
                </div>

                {/* Mot principal */}
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-1 tracking-tight">
                    {word.ORTHO}
                </h3>

                {/* Phonétique */}
                <p className="text-sm text-muted-foreground font-mono mb-4">
                    /{word.PHON}/
                </p>

                {/* Badges - style pills comme le SaaS */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge
                        className="text-xs font-medium bg-primary/10 text-primary border-0 hover:bg-primary/20"
                    >
                        {syntLabel}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs font-mono bg-white"
                    >
                        {word.NBSYLL} syll
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs font-mono bg-white"
                    >
                        {word.NBLET} let
                    </Badge>
                </div>

                {/* Découpage syllabique */}
                <div className="text-sm text-muted-foreground">
                    <span className="font-mono bg-muted/50 px-2 py-1 rounded-lg text-foreground/80">
                        {word.PSYLL}
                    </span>
                </div>

                {/* Barre de fréquence */}
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(frequency / 4, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                        {frequency.toFixed(1)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
