import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Word, SYNT_LABELS, STRUCTURE_LABELS, GRAPHEME_LABELS } from "@/types/word";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    const syntLabel = SYNT_LABELS[word.SYNT] || word.SYNT;
    const frequency = parseFloat(word["fréquence"].replace(',', '.'));

    return (
        <Card
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/50 bg-card/50 backdrop-blur-sm"
            onClick={() => onClick?.(word)}
        >
            <CardContent className="p-4">
                {/* Mot principal */}
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
                    {word.ORTHO}
                </h3>

                {/* Phonétique */}
                <p className="text-sm text-muted-foreground font-mono mb-3">
                    /{word.PHON}/
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <Badge variant="secondary" className="text-xs">
                        {syntLabel}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {word.NBSYLL} syll.
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        {word.NBLET} let.
                    </Badge>
                </div>

                {/* Découpage syllabique */}
                <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Syllabes:</span>{" "}
                    <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">
                        {word.PSYLL}
                    </span>
                </div>

                {/* Fréquence */}
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all"
                            style={{ width: `${Math.min(frequency / 5, 100)}%` }}
                        />
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {frequency.toFixed(1)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
