import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Word, SYNT_LABELS } from "@/types/word";

interface WordCardProps {
    word: Word;
    onClick?: (word: Word) => void;
}

export function WordCard({ word, onClick }: WordCardProps) {
    // Remplacer les tirets ou points par des points médians
    const formattedSyllables = word.PSYLL.replace(/[-.]/g, ' · ');

    return (
        <Card
            className="
        group cursor-pointer relative 
        bg-white/50 border-transparent hover:border-black/5 hover:bg-white
        transition-all duration-300 ease-out
        hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1
      "
            onClick={() => onClick?.(word)}
        >
            <CardContent className="p-4 flex flex-col items-center text-center gap-1.5 h-full justify-center min-h-[110px]">

                {/* Structure Code (Discrete Top Right) */}
                <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        {word["code structure"]}
                    </span>
                </div>

                {/* Mot Principal - FOCUS */}
                <h3 className="text-xl font-bold text-foreground/90 tracking-tight leading-none group-hover:text-primary transition-colors">
                    {word.ORTHO}
                </h3>

                {/* Phonétique - Support */}
                <p className="text-sm text-muted-foreground/60 font-mono">
                    [{word.PHON}]
                </p>

                {/* Syllabes - Technique mais discret */}
                <div className="mt-2 text-xs font-medium text-primary/80 font-mono bg-primary/5 px-2 py-0.5 rounded-md opacity-70 group-hover:opacity-100 transition-opacity">
                    {formattedSyllables}
                </div>

            </CardContent>
        </Card>
    );
}
