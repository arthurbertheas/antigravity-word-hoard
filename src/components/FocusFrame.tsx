import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Word } from "@/types/word";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FocusFrameProps {
    words: Word[];
    isOpen: boolean;
    onClose: () => void;
}

export function FocusFrame({ words, isOpen, onClose }: FocusFrameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [fadeKey, setFadeKey] = useState(0);

    // Accessibility Defaults
    const [textScale, setTextScale] = useState([1]);
    const [letterSpacing, setLetterSpacing] = useState([0]);

    const validWords = words.filter(w => w && w.ORTHO);
    const currentWord = validWords[currentIndex];

    // --- PARENT COMMUNICATION ---
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
            setCurrentIndex(0);
            setFadeKey(0);

            // Lock internal scroll
            document.body.style.overflow = 'hidden';

            // Tell Parent (Webflow) that we are OPEN
            // (Webflow script will hide the external bar)
            window.parent.postMessage({ type: 'focus_mode_change', isOpen: true }, '*');

        } else {
            setIsClosing(true);

            // Notify parent IMMEDIATELY to show the external bar again
            window.parent.postMessage({ type: 'focus_mode_change', isOpen: false }, '*');

            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
                document.body.style.overflow = '';
            }, 300);
            return () => {
                clearTimeout(timer);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen]);

    // Cleanup
    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
            // Ensure we tell parent we are closed if unmounted
            window.parent.postMessage({ type: 'focus_mode_change', isOpen: false }, '*');
        };
    }, []);

    // Keyboard
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === " ") {
                e.preventDefault();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, validWords.length]);

    const handleClose = () => {
        setIsClosing(true);
        window.parent.postMessage({ type: 'focus_mode_change', isOpen: false }, '*');
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setFadeKey(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < validWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFadeKey(prev => prev + 1);
        }
    };

    if (!isVisible && !isOpen) return null;
    if (!currentWord) return null;

    return (
        <div
            className={cn(
                // Fixed Fullscreen Overlay (inside Iframe)
                "fixed inset-0 z-[2147483647] bg-[#fafafa] flex flex-col items-center justify-center overflow-hidden",
                isClosing ? "animate-slide-out-bottom" : "animate-slide-in-bottom"
            )}
            style={{
                width: '100%',
                height: '100%'
            }}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
        >
            {/* Top Controls */}

            {/* Accessibility (Left) */}
            <div className="absolute top-6 left-6 z-[2147483647]">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-border bg-white shadow-sm hover:bg-gray-50 hover:scale-105 transition-all">
                            <Settings2 className="w-6 h-6 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 ml-4 p-5 space-y-6 shadow-2xl border-border/60 bg-white/95 backdrop-blur-sm rounded-xl" side="bottom" align="start">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-foreground">Taille du texte</label>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">x{textScale[0]}</span>
                            </div>
                            <Slider
                                value={textScale}
                                onValueChange={setTextScale}
                                min={0.5}
                                max={2}
                                step={0.1}
                                className="w-full cursor-pointer"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-foreground">Espacement</label>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">{letterSpacing[0]}em</span>
                            </div>
                            <Slider
                                value={letterSpacing}
                                onValueChange={setLetterSpacing}
                                min={-0.05}
                                max={0.5}
                                step={0.01}
                                className="w-full cursor-pointer"
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Close (Right) */}
            <div className="absolute top-6 right-6 z-[2147483647]">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-12 w-12 rounded-full hover:bg-black/5"
                    aria-label="Fermer"
                >
                    <X className="w-8 h-8 text-foreground/70" />
                </Button>
            </div>


            {/* Content */}
            <div key={fadeKey} className="w-full px-5 animate-fade-in-word flex justify-center items-center">
                <h1
                    className="font-bold tracking-tight text-foreground leading-none select-none text-center break-words w-full"
                    style={{
                        fontSize: `calc(clamp(2rem, 8vw, 6rem) * ${textScale[0]})`,
                        letterSpacing: `${letterSpacing[0]}em`,
                        padding: '0 20px',
                        maxWidth: '100%'
                    }}
                >
                    {currentWord.ORTHO}
                </h1>
            </div>


            {/* Navigation Capsule */}
            <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-[2147483647]">
                <div className="flex items-center gap-1 bg-white border border-black/5 shadow-2xl rounded-full p-2 pl-3 hover-lift transition-all">

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="h-11 w-11 rounded-full hover:bg-black/5 disabled:opacity-20"
                    >
                        <ChevronLeft className="w-7 h-7 text-foreground" />
                    </Button>

                    <div className="px-4 min-w-[80px] text-center">
                        <span className="text-sm font-bold font-mono text-muted-foreground">
                            {currentIndex + 1} / {validWords.length}
                        </span>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        disabled={currentIndex === validWords.length - 1}
                        className="h-11 w-11 rounded-full hover:bg-black/5 disabled:opacity-20"
                    >
                        <ChevronRight className="w-7 h-7 text-foreground" />
                    </Button>

                </div>
            </div>

        </div>
    );
}
