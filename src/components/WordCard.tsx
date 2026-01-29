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
            <CardContent className="p-4 flex flex-col gap-2">
                {/* Structure syllabique (Top right) */}
                <div className="absolute top-3 right-3">
                    <span className="text-xs font-mono text-primary/70 bg-primary/5 px-2 py-0.5 rounded text-foreground/70">
                        {word.PSYLL}
                    </span>
                </div>

                {/* Mot principal */}
                <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {word.ORTHO}
                </h3>

                {/* Phonétique */}
                <p className="text-sm text-muted-foreground font-mono">
                    /{word.PHON}/
                </p>
            </CardContent>
        </Card>
    );
}
