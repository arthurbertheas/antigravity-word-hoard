import React, { useMemo } from 'react';
import { Word } from '@/types/word';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';

interface WordDisplayProps {
    word: Word;
}

// List of vowel graphemes in French (including basic and complex)
const VOWEL_GRAPHEMES = new Set([
    'a', 'à', 'â', 'e', 'é', 'è', 'ê', 'ë', 'i', 'î', 'ï', 'o', 'ô', 'u', 'û', 'ù', 'y',
    'ai', 'ei', 'au', 'eau', 'eu', 'ou', 'oi', 'oeu', 'oe',
    'on', 'om', 'an', 'am', 'en', 'em', 'in', 'im', 'un', 'um', 'ain', 'ein', 'aim',
    'oin', 'ien', 'ian', 'ion'
]);

export function WordDisplay({ word }: WordDisplayProps) {
    if (!word || !word.GSEG) return null;
    const { settings, phase } = usePlayer();

    const segments = useMemo(() => {
        // GSEG format: ".b.u.r.eau" or ".a.cc.i.d.en.t"
        return word.GSEG.split('.').filter(s => s.length > 0);
    }, [word.GSEG]);

    if (phase === 'gap') {
        return <div className="h-full w-full bg-white" />;
    }

    const fontStyles: React.CSSProperties = {
        fontSize: `${settings.fontSize}px`,
        letterSpacing: `${settings.letterSpacing}px`,
        fontFamily: settings.fontFamily === 'opendyslexic' ? 'OpenDyslexic, sans-serif' : 'inherit',
    };

    const containerClasses = cn(
        "flex items-center justify-center text-center transition-all duration-200",
        settings.fontFamily === 'sans' && "font-sans",
        settings.fontFamily === 'serif' && "font-serif",
        settings.fontFamily === 'mono' && "font-mono",
        // OpenDyslexic classes should be handled via @font-face and fontStyles
    );

    return (
        <div className="h-full w-full relative bg-white overflow-hidden">
            <div
                className={cn(containerClasses, "absolute left-1/2 -translate-x-1/2 -translate-y-1/2")}
                style={{ ...fontStyles, top: '30%' }}
            >
                {segments.map((seg, idx) => {
                    const isVowel = VOWEL_GRAPHEMES.has(seg.toLowerCase());
                    return (
                        <span
                            key={idx}
                            className={cn(
                                "inline-block",
                                settings.highlightVowels && isVowel && "text-red-500 font-bold"
                            )}
                        >
                            {seg}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
