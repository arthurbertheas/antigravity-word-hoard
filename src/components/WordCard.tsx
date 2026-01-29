import { Word, SYNT_LABELS } from "@/types/word";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    const syntLabel = SYNT_LABELS[word.SYNT] || word.SYNT;

    return (
        <div
            className="
        bg-white rounded-xl border border-border p-4
        cursor-pointer transition-all duration-150
        hover:border-primary/40 hover:shadow-sm
      "
            onClick={() => onClick?.(word)}
        >
            {/* Mot */}
            <h3 className="text-lg font-semibold text-foreground mb-0.5">
                {word.ORTHO}
            </h3>

            {/* Phonétique */}
            <p className="text-sm text-muted-foreground font-mono mb-3">
                /{word.PHON}/
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="pill text-xs py-1 px-2 bg-primary/5 border-primary/20 text-primary">
                    {syntLabel}
                </span>
                <span className="pill text-xs py-1 px-2 font-mono">
                    {word.NBSYLL} syll
                </span>
            </div>

            {/* Structure syllabique */}
            <div className="text-sm font-mono text-muted-foreground bg-muted/50 rounded-md px-2 py-1 inline-block">
                {word.PSYLL}
            </div>
        </div>
    );
}
