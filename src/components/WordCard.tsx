import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Word, SYNT_LABELS } from "@/types/word";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    // Mapping court pour les badges de structure
    const SHORT_STRUCTURE_LABELS: Record<string, string> = {
        a: 'CV Simple',
        b: 'CVC / VCV',
        c: 'E muet',
        d: 'Cons. Double',
        e: 'Fin. Muette',
        f: 'Gr. Cons. Simple',
        g: 'Gr. Cons. Complexe'
    };

    const structureLabel = SHORT_STRUCTURE_LABELS[word["code structure"]] || word["code structure"];
    // Remplacer les tirets ou points par des points médians pour la lisibilité
    const formattedSyllables = word.PSYLL.replace(/[-.]/g, ' · ');

    return (
        <Card
            className="
        group cursor-pointer relative overflow-hidden
        bg-white border-border/60 hover:border-primary/50
        transition-all duration-200 ease-out
        hover-lift shadow-sm hover:shadow-md
      "
            onClick={() => onClick?.(word)}
        >
            <CardContent className="p-0">
                {/* Partie Supérieure : Identité du mot */}
                <div className="p-4 bg-white">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-primary tracking-tight leading-tight">
                            {word.ORTHO}
                        </h3>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                        [{word.PHON}]
                    </p>
                </div>

                {/* Séparateur */}
                <div className="h-px bg-border/60 w-full" />

                {/* Partie Inférieure : Zone Technique */}
                <div className="p-3 bg-muted/30 flex justify-between items-center gap-2">
                    {/* Découpage syllabique */}
                    <span className="text-sm font-bold text-[#0056b3] font-mono tracking-wide">
                        {formattedSyllables}
                    </span>

                    {/* Tag Structure */}
                    <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 bg-white border-primary/20 text-primary/80 font-medium whitespace-nowrap"
                    >
                        {structureLabel}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
