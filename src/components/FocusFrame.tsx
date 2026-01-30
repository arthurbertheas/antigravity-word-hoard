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
    const [fadeKey, setFadeKey] = useState(0); // Key to trigger word fade animation

    // Accessibility State
    const [textSize, setTextSize] = useState([8]); // rem unit
    const [letterSpacing, setLetterSpacing] = useState([0]); // em unit

    // Filter out invalid words
    const validWords = words.filter(w => w && w.ORTHO);
    const currentWord = validWords[currentIndex];

    // Handle open/close animations
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
            setCurrentIndex(0);
            setFadeKey(0);
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            } else if (e.key === "ArrowRight") {
                handleNext();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, currentIndex, validWords.length]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setFadeKey(prev => prev + 1); // Trigger fade
        }
    };

    const handleNext = () => {
        if (currentIndex < validWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setFadeKey(prev => prev + 1); // Trigger fade
        }
    };

    if (!isVisible && !isOpen) return null;
    if (!currentWord) return null;

    return (
        <div
            className={cn(
                "fixed inset-0 z-[100] bg-[#fafafa] flex flex-col items-center justify-between",
                isClosing ? "animate-slide-out-bottom" : "animate-slide-in-bottom"
            )}
        >
            {/* Header */}
            <div className="w-full flex justify-between items-center p-6 md:p-8 relative z-50">

                {/* Accessibility Toolbar */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border bg-white shadow-sm hover:bg-gray-50">
                            <Settings2 className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 ml-4 p-4 space-y-4 shadow-xl border-border/60 bg-white/95 backdrop-blur-sm" side="bottom" align="start">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">Taille du texte</label>
                                <span className="text-xs text-muted-foreground">{textSize[0]}rem</span>
                            </div>
                            <Slider
                                value={textSize}
                                onValueChange={setTextSize}
                                min={4}
                                max={16}
                                step={0.5}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground">Espacement</label>
                                <span className="text-xs text-muted-foreground">{letterSpacing[0]}em</span>
                            </div>
                            <Slider
                                value={letterSpacing}
                                onValueChange={setLetterSpacing}
                                min={-0.05}
                                max={0.5}
                                step={0.01}
                                className="w-full"
                            />
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-12 w-12 rounded-full hover:bg-black/5"
                >
                    <X className="w-8 h-8 text-muted-foreground" />
                </Button>
            </div>

            {/* Main Content Area (with side arrows) */}
            <div className="flex-1 w-full flex items-center justify-between px-4 sm:px-12 md:px-24 pb-20">

                {/* Previous Arrow */}
                <Button
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="h-32 w-20 md:w-32 rounded-3xl hover:bg-black/5 disabled:opacity-0 transition-opacity hidden sm:flex items-center justify-center p-0"
                >
                    <ChevronLeft className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/40" />
                </Button>

                {/* The Word */}
                <div key={fadeKey} className="flex-1 flex justify-center items-center animate-fade-in-word">
                    <h1
                        className="font-bold tracking-tight text-foreground leading-none select-none text-center break-words max-w-5xl"
                        style={{
                            fontSize: `${textSize[0]}rem`,
                            letterSpacing: `${letterSpacing[0]}em`
                        }}
                    >
                        {currentWord.ORTHO}
                    </h1>
                </div>

                {/* Next Arrow */}
                <Button
                    variant="ghost"
                    onClick={handleNext}
                    disabled={currentIndex === validWords.length - 1}
                    className="h-32 w-20 md:w-32 rounded-3xl hover:bg-black/5 disabled:opacity-0 transition-opacity hidden sm:flex items-center justify-center p-0"
                >
                    <ChevronRight className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/60" />
                </Button>

            </div>

            {/* Footer / Counter (Optional, kept minimal) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
                <div className="bg-muted/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-mono text-muted-foreground">
                    {currentIndex + 1} / {validWords.length}
                </div>
            </div>
        </div>
    );
}
