import React, { useMemo } from 'react';
import { Word } from '@/types/word';
import { cn } from '@/lib/utils';
import { usePlayer } from '@/contexts/PlayerContext';
import { parseGPMATCH, getGraphemeType } from '@/utils/cgp-parser';

interface WordDisplayProps {
    word: Word;
}

export function WordDisplay({ word, forceVisible = false }: WordDisplayProps & { forceVisible?: boolean }) {
    // If not word and not forcing, return null. Note: on 'gap', word might be present but phase is gap.
    if (!word || !word.GSEG) return null;
    const { settings, phase } = usePlayer();

    // Parse GPMATCH for precise grapheme-phoneme mapping
    const parsedGraphemes = useMemo(() => {
        try {
            if (word.GPMATCH) {
                return parseGPMATCH(word.GPMATCH);
            }
        } catch (e) {
            console.error("Error parsing GPMATCH:", e);
        }

        // Fallback to GSEG (if parse fails or no GPMATCH)
        // Check if GSEG exists first
        if (!word.GSEG) return [];

        return word.GSEG.split('.').filter(s => s.length > 0).map(seg => ({
            grapheme: seg,
            phoneme: '',
            type: getGraphemeType(seg)
        }));
    }, [word.GPMATCH, word.GSEG]);

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
                    {/* Finer cross as requested */}
                    <div className="absolute w-[2px] h-8 bg-zinc-900 rounded-full" />
                    <div className="absolute w-8 h-[2px] bg-zinc-900 rounded-full" />
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
                    settings.fontFamily === 'mdi-ecole' ? '"MDI Ecole", Arial, sans-serif' : 'Arial, sans-serif',
    };

    const containerClasses = cn(
        "flex items-center justify-center text-center w-full",
        (settings.fontFamily === 'sans' || settings.fontFamily === 'arial') && "font-sans",
        settings.fontFamily === 'serif' && "font-serif",
        settings.fontFamily === 'mono' && "font-mono",
    );

    return renderContent(
        <div
            className={containerClasses}
            style={fontStyles}
        >
            {parsedGraphemes.map((parsed, idx) => {
                // Skip if already processed (for e: lookahead)
                if ((parsed as any)._skipRender) return null;

                // Determine styling based on grapheme type and settings
                let colorClass = '';

                if (settings.highlightVowels && parsed.type === 'voyelle') {
                    colorClass = 'text-red-500'; // Vowels in red
                } else if (settings.highlightSilent && parsed.type === 'muette') {
                    colorClass = 'text-gray-400'; // Silent letters in gray
                }
                // Consonants keep default color (black)

                // Special handling for contextual E (e:)
                if (parsed.grapheme === 'e:') {
                    // Collect following consonants to highlight with e:
                    const consonantsToHighlight = [];
                    let lookAhead = 1;

                    while (idx + lookAhead < parsedGraphemes.length) {
                        const nextGrapheme = parsedGraphemes[idx + lookAhead];
                        if (nextGrapheme.type === 'consonne') {
                            consonantsToHighlight.push(nextGrapheme);
                            // Mark as processed to avoid double rendering
                            (nextGrapheme as any)._skipRender = true;
                            lookAhead++;
                        } else {
                            break; // Stop at next vowel or non-consonant
                        }
                    }

                    // Render e: as "e" + consonants
                    if (settings.highlightVowels) {
                        return (
                            <span key={idx} className="inline-block text-red-500">
                                e{consonantsToHighlight.map(c => c.grapheme).join('')}
                            </span>
                        );
                    } else {
                        return (
                            <span key={idx} className="inline-block">
                                e{consonantsToHighlight.map(c => c.grapheme).join('')}
                            </span>
                        );
                    }
                }

                // Special handling for graphemes with contextual silent letters
                const graphemeLower = parsed.grapheme.toLowerCase();

                if (settings.highlightSilent && (graphemeLower === 'qu' || graphemeLower === 'ge' || graphemeLower === 'gu')) {
                    // Split the grapheme to highlight the silent letter
                    const firstLetter = parsed.grapheme[0];
                    const silentLetter = parsed.grapheme[1];

                    return (
                        <span key={idx} className="inline-block">
                            <span className={cn(settings.highlightVowels && parsed.type === 'voyelle' ? 'text-red-500' : '')}>
                                {firstLetter}
                            </span>
                            <span className="text-gray-400">
                                {silentLetter}
                            </span>
                        </span>
                    );
                }

                return (
                    <span
                        key={idx}
                        className={cn("inline-block", colorClass)}
                    >
                        {parsed.grapheme}
                    </span>
                );
            })}
        </div>
    );
}
