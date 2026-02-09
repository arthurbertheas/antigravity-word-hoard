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
    if (!word || !word["segmentation graphèmes"]) return null;
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

        // Fallback to segmentation graphèmes (if parse fails or no GPMATCH)
        // Check if field exists first
        if (!word["segmentation graphèmes"]) return [];

        return word["segmentation graphèmes"].split('.').filter(s => s.length > 0).map(seg => ({
            grapheme: seg,
            phoneme: '',
            type: getGraphemeType(seg)
        }));
    }, [word.GPMATCH, word["segmentation graphèmes"]]);

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

                // Determine if this word should be excluded from highlighting
                const isExcluded = ["Prêt ?", "Bravo !"].includes(word.MOTS);

                // Determine styling based on grapheme type and settings
                let colorClass = '';

                if (!isExcluded) {
                    if (settings.highlightVowels && parsed.type === 'voyelle') {
                        colorClass = 'text-red-500'; // Vowels in red
                    } else if (settings.highlightSilent && parsed.type === 'muette') {
                        colorClass = 'text-gray-400'; // Silent letters in gray
                    }
                }
                // Consonants keep default color (black)

                if (parsed.grapheme === 'e:' && !isExcluded) {
                    // Collect following consonants to highlight with e:
                    const consonantsToHighlight = [];
                    let lookAhead = 1;

                    while (idx + lookAhead < parsedGraphemes.length) {
                        // General Rule: 'e' never drags more than 2 consonants
                        if (consonantsToHighlight.length >= 2) break;

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

                    // Render e: as "e" (Red if vowels highlighted) + consonants (Maroon)
                    const eColor = settings.highlightVowels ? "text-red-500" : "";

                    return (
                        <span key={idx} className="inline-block">
                            <span className={eColor}>e</span>
                            {consonantsToHighlight.map((c, i) => {
                                const gLower = c.grapheme.toLowerCase();
                                const isDigraphWithSilent = settings.highlightSilent && (gLower === 'qu' || gLower === 'ge' || gLower === 'gu');

                                if (isDigraphWithSilent) {
                                    return (
                                        <span key={i} className="inline-block">
                                            <span className="text-[#800000]">{c.grapheme[0]}</span>
                                            <span className="text-gray-400">{c.grapheme[1]}</span>
                                        </span>
                                    );
                                }

                                return (
                                    <span key={i} className="text-[#800000]">
                                        {c.grapheme}
                                    </span>
                                );
                            })}
                        </span>
                    );
                }


                // Special handling for graphemes with contextual silent letters - only if not excluded
                const graphemeLower = parsed.grapheme.toLowerCase();

                if (!isExcluded && settings.highlightSilent && (graphemeLower === 'qu' || graphemeLower === 'ge' || graphemeLower === 'gu')) {
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
