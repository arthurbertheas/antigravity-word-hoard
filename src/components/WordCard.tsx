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
    const codeGrapheme = parseInt(word["code graphèmes"], 10);

    // Color based on grapheme complexity
    const getComplexityColor = () => {
        if (codeGrapheme <= 3) return 'from-emerald-500/20 to-emerald-500/5';
        if (codeGrapheme <= 6) return 'from-primary/20 to-primary/5';
        if (codeGrapheme <= 9) return 'from-secondary/20 to-secondary/5';
        return 'from-accent/20 to-accent/5';
    };

    return (
        <Card
            className={`
        group cursor-pointer relative overflow-hidden
        transition-all duration-300 ease-out
        hover-lift box-glow-hover
        border-border/50 hover:border-primary/50
        bg-gradient-to-br ${getComplexityColor()}
        glass
      `}
            onClick={() => onClick?.(word)}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/5 group-hover:to-secondary/5 transition-all duration-500" />

            {/* Glow effect */}
            <div className="absolute -inset-px bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] blur-sm" />

            <CardContent className="relative p-5">
                {/* Complexity indicator */}
                <div className="absolute top-3 right-3">
                    <span className="text-xs font-mono text-muted-foreground/60">
                        {word["code graphèmes"]}
                    </span>
                </div>

                {/* Mot principal */}
                <h3 className="text-2xl font-bold text-foreground group-hover:gradient-text transition-all duration-300 mb-1 tracking-tight">
                    {word.ORTHO}
                </h3>

                {/* Phonétique */}
                <p className="text-sm text-muted-foreground font-mono mb-4 tracking-wide">
                    /{word.PHON}/
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                    <Badge
                        variant="secondary"
                        className="text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    >
                        {syntLabel}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs font-mono border-border/50"
                    >
                        {word.NBSYLL} syll
                    </Badge>
                    <Badge
                        variant="outline"
                        className="text-xs font-mono border-border/50"
                    >
                        {word.NBLET} let
                    </Badge>
                </div>

                {/* Découpage syllabique */}
                <div className="text-sm text-muted-foreground mb-3">
                    <span className="font-mono bg-muted/30 px-2 py-1 rounded-md text-foreground/80 tracking-wider">
                        {word.PSYLL}
                    </span>
                </div>

                {/* Barre de fréquence */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1 bg-muted/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500 group-hover:shadow-[0_0_10px_hsl(187_100%_55%/0.5)]"
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
