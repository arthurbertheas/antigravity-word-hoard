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

    // Check if word has an associated image
    const hasImage = word["image associée"] && word["image associée"].trim().length > 0;

    // Track image loading state
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [currentImageUrl, setCurrentImageUrl] = React.useState<string | null>(null);

    // Reset image loaded state when word changes
    React.useEffect(() => {
        if (hasImage && word["image associée"] !== currentImageUrl) {
            setImageLoaded(false);
            setCurrentImageUrl(word["image associée"]);

            // Preload image
            const img = new Image();
            img.onload = () => setImageLoaded(true);
            img.onerror = () => setImageLoaded(true); // Still show even if image fails to load
            img.src = word["image associée"];
        } else if (!hasImage) {
            setImageLoaded(true);
            setCurrentImageUrl(null);
        }
    }, [word["image associée"], hasImage, currentImageUrl]);

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
        if (!word["segmentation graphèmes"]) return [];

        return word["segmentation graphèmes"].split(/[-.]/).filter(s => s.length > 0).map(seg => ({
            grapheme: seg,
            phoneme: '',
            type: getGraphemeType(seg)
        }));
    }, [word.GPMATCH, word["segmentation graphèmes"]]);

    // Calculate segment boundaries (where to apply spacing)
    const segmentBoundaries = useMemo(() => {
        if (settings.spacingMode === 'letters') return new Set();

        const modeField = settings.spacingMode === 'syllables'
            ? word["segmentation syllabique"]
            : word["segmentation graphèmes"];

        // Robust fallback: if syllables requested but missing, try graphemes
        const activeSegmentation = modeField || word["segmentation graphèmes"];
        if (!activeSegmentation) return new Set();

        // 1. Find the target character positions from the segmentation field
        // We split by [-.] and count alphanumeric chars as boundaries
        const parts = activeSegmentation.split(/[-.]/);
        const gapPositions: number[] = [];
        let totalChars = 0;
        for (let i = 0; i < parts.length - 1; i++) {
            totalChars += parts[i].toLowerCase().replace(/[^a-zÀ-ÿ0-9]/g, '').length;
            gapPositions.push(totalChars);
        }

        // 2. Map these character positions to grapheme indices
        const boundaries = new Set<number>();
        let cumulativeGraphemeChars = 0;

        parsedGraphemes.forEach((parsed, idx) => {
            const cleanGrapheme = parsed.grapheme.toLowerCase().replace(/[^a-zÀ-ÿ0-9]/g, '');
            cumulativeGraphemeChars += cleanGrapheme.length;

            // If this grapheme ends at one of our target gap positions, mark it as a boundary
            if (gapPositions.includes(cumulativeGraphemeChars)) {
                boundaries.add(idx);
            }
        });

        return boundaries;
    }, [parsedGraphemes, settings.spacingMode, word]);

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
                    <div className="absolute w-[2px] h-8 bg-zinc-900 rounded-full" />
                    <div className="absolute w-8 h-[2px] bg-zinc-900 rounded-full" />
                </div>
            ) : null
        );
    }

    const fontStyles: React.CSSProperties = {
        fontSize: `${settings.fontSize}vmin`,
        letterSpacing: settings.spacingMode === 'letters' ? `${settings.spacingValue / 10}em` : 'normal',
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

    const skippedIndices = new Set<number>();

    // Render word content
    const wordContent = (
        <div
            className="flex flex-wrap items-center justify-center gap-0 leading-none select-none"
            style={fontStyles}
        >
            {parsedGraphemes.map((parsed, idx) => {
                if (skippedIndices.has(idx)) return null;

                const isExcluded = ["Prêt ?", "Bravo !"].includes(word.MOTS);
                let colorClass = '';

                if (!isExcluded) {
                    if (settings.highlightVowels && parsed.type === 'voyelle') {
                        colorClass = 'text-red-500';
                    } else if (settings.highlightSilent && parsed.type === 'muette') {
                        colorClass = 'text-gray-400';
                    }
                }

                // Spacing logic for non-letters mode
                const needsMargin = settings.spacingMode !== 'letters' && segmentBoundaries.has(idx);
                const itemStyle = needsMargin && idx < parsedGraphemes.length - 1
                    ? { marginRight: `${settings.spacingValue / 10}em` }
                    : {};

                // Special handling for e: (drags consonants)
                if (parsed.grapheme.toLowerCase() === 'e:' || (parsed.grapheme.toLowerCase() === 'e' && parsed.phoneme === 'ɛ')) {
                    const consonantsToHighlight: { grapheme: string, phoneme: string, type: string, needsMargin: boolean }[] = [];
                    let lookAhead = 1;

                    const eNeedsMargin = settings.spacingMode !== 'letters' && segmentBoundaries.has(idx);

                    while (idx + lookAhead < parsedGraphemes.length) {
                        if (consonantsToHighlight.length >= 2) break;

                        const nextGrapheme = parsedGraphemes[idx + lookAhead];
                        if (nextGrapheme.type === 'consonne') {
                            const needsMargin = settings.spacingMode !== 'letters' && segmentBoundaries.has(idx + lookAhead);
                            consonantsToHighlight.push({ ...nextGrapheme, needsMargin });
                            skippedIndices.add(idx + lookAhead);
                            lookAhead++;
                        } else {
                            break;
                        }
                    }

                    const eColor = settings.highlightVowels ? "text-red-500" : "";
                    const brownColorClass = settings.highlightVowels ? "text-[#800000]" : "";
                    const marginValue = `${settings.spacingValue / 10}em`;

                    return (
                        <span key={idx} className="inline-block">
                            <span className={eColor} style={eNeedsMargin ? { marginRight: marginValue } : {}}>e</span>
                            {consonantsToHighlight.map((c, i) => {
                                const gLower = c.grapheme.toLowerCase();
                                const isDigraphWithSilent = settings.highlightSilent && (gLower === 'qu' || gLower === 'ge' || gLower === 'gu');
                                const itemStyle = c.needsMargin && (idx + i + 1) < parsedGraphemes.length - 1
                                    ? { marginRight: marginValue }
                                    : {};

                                if (isDigraphWithSilent) {
                                    return (
                                        <span key={i} className="inline-block" style={itemStyle}>
                                            <span className={brownColorClass}>{c.grapheme[0]}</span>
                                            <span className="text-gray-400">{c.grapheme[1]}</span>
                                        </span>
                                    );
                                }

                                return (
                                    <span key={i} className={cn("inline-block", brownColorClass)} style={itemStyle}>
                                        {c.grapheme}
                                    </span>
                                );
                            })}
                        </span>
                    );
                }

                // Special handling for digraphs with silent letters
                const graphemeLower = parsed.grapheme.toLowerCase();
                const isSilentDigraph = settings.highlightSilent && (graphemeLower === 'qu' || graphemeLower === 'ge' || graphemeLower === 'gu');

                if (isSilentDigraph && parsed.grapheme.length === 2) {
                    const mainLetter = parsed.grapheme[0];
                    const silentLetter = parsed.grapheme[1];
                    const mainColor = colorClass; // Still red if vowel, but usually consonants

                    return (
                        <span key={idx} className="inline-block" style={itemStyle}>
                            <span className={mainColor}>{mainLetter}</span>
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
                        style={itemStyle}
                    >
                        {parsed.grapheme}
                    </span>
                );
            })}
        </div>
    );

    // Determine what to display based on displayMode
    const shouldShowImage = hasImage && (settings.displayMode === 'image' || settings.displayMode === 'imageAndWord');
    const shouldShowWord = settings.displayMode === 'wordOnly' || settings.displayMode === 'imageAndWord' || !hasImage;

    // Wait for image to load before displaying content (prevents visual delay)
    const shouldWaitForImage = shouldShowImage && !imageLoaded && phase === 'display';

    // Build final display content
    let displayContent;

    if (shouldShowImage && shouldShowWord) {
        // imageAndWord mode
        displayContent = (
            <div className="flex flex-col items-center justify-center gap-8">
                <img
                    src={word["image associée"]}
                    alt={word.MOTS}
                    className="max-w-[40vmin] max-h-[30vmin] object-contain"
                    style={{ opacity: imageLoaded ? 1 : 0 }}
                />
                {wordContent}
            </div>
        );
    } else if (shouldShowImage && !shouldShowWord) {
        // image only mode
        displayContent = (
            <img
                src={word["image associée"]}
                alt={word.MOTS}
                className="max-w-[60vmin] max-h-[50vmin] object-contain"
                style={{ opacity: imageLoaded ? 1 : 0 }}
            />
        );
    } else {
        // wordOnly mode (default)
        displayContent = wordContent;
    }

    // Don't show content until image is loaded (prevents flicker)
    if (shouldWaitForImage) {
        return renderContent(null);
    }

    return renderContent(displayContent);
}
