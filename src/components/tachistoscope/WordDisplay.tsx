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

export function WordDisplay({ word, forceVisible = false }: WordDisplayProps & { forceVisible?: boolean }) {
    // If not word and not forcing, return null. Note: on 'gap', word might be present but phase is gap.
    if (!word || !word.GSEG) return null;
    const { settings, phase } = usePlayer();

    const segments = useMemo(() => {
        // GSEG format: ".b.u.r.eau" or ".a.cc.i.d.en.t"
        return word.GSEG.split('.').filter(s => s.length > 0);
    }, [word.GSEG]);

    // SAME CONTAINER STRUCTURE for both word and gap to ensure perfect alignment
    const renderContent = (content: React.ReactNode) => (
        <div className="h-full w-full flex flex-col bg-white overflow-hidden absolute inset-0">
            {/* STIMULUS ZONE (75% height) */}
            <div className="flex-[3] flex items-center justify-center p-8 bg-white overflow-hidden">
                {content}
            </div>

            {/* UI SAFE ZONE (25% height) */}
            <div className="flex-1 pointer-events-none" />
        </div>
    );

    if (phase === 'gap' && !forceVisible) {
        return renderContent(
            settings.showFocusPoint ? (
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Thicker and darker lines for high visibility */}
                    <div className="absolute w-[6px] h-16 bg-zinc-900 rounded-full" />
                    <div className="absolute w-16 h-[6px] bg-zinc-900 rounded-full" />
                </div>
            ) : null
        );
    }

    const fontStyles: React.CSSProperties = {
        fontSize: `${settings.fontSize}vmin`,
        letterSpacing: `${settings.letterSpacing}px`,
        fontFamily: settings.fontFamily === 'opendyslexic' ? 'OpenDyslexic, sans-serif' :
            settings.fontFamily === 'arial' ? 'Arial, sans-serif' :
                settings.fontFamily === 'verdana' ? 'Verdana, sans-serif' :
                    settings.fontFamily === 'mdi-ecole' ? '"MDI Ecole", cursive' : 'inherit',
    };

    const containerClasses = cn(
        "flex items-center justify-center text-center transition-all duration-200 w-full",
        (settings.fontFamily === 'sans' || settings.fontFamily === 'arial') && "font-sans",
        settings.fontFamily === 'serif' && "font-serif",
        settings.fontFamily === 'mono' && "font-mono",
    );

    return renderContent(
        <div
            className={containerClasses}
            style={fontStyles}
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
    );
}
