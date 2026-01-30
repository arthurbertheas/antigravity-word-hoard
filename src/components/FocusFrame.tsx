import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Speaker } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Word } from "@/types/word";
import { cn } from "@/lib/utils";

interface FocusFrameProps {
    words: Word[];
    isOpen: boolean;
    onClose: () => void;
}

export function FocusFrame({ words, isOpen, onClose }: FocusFrameProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Filter out invalid words just in case
    const validWords = words.filter(w => w && w.ORTHO);
    const currentWord = validWords[currentIndex];

    // Handle open/close animations
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            setIsClosing(false);
            setCurrentIndex(0); // Reset to start when opening
        } else {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setIsClosing(false);
            }, 300); // Match CSS animation duration
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
    }, [isOpen, currentIndex, validWords.length]); // Dependencies for closure values

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleNext = () => {
        // Stop at end (no loop) as per plan
        if (currentIndex < validWords.length - 1) {
            setCurrentIndex(prev => prev + 1);
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
            <div className="w-full flex justify-end p-6 md:p-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-12 w-12 rounded-full hover:bg-black/5"
                >
                    <X className="w-8 h-8 text-muted-foreground" />
                </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center -mt-20 w-full max-w-5xl px-4 animate-fade-in delay-150 fill-mode-forwards opacity-0">

                {/* Word Display */}
                <div className="text-center space-y-6 md:space-y-10">
                    <h1 className="text-[5rem] md:text-[8rem] lg:text-[10rem] font-bold tracking-tight text-foreground leading-none select-none">
                        {currentWord.ORTHO}
                    </h1>

                    {/* Optional Phonetic/Details (Smaller) */}
                    <div className="flex items-center justify-center gap-4 opacity-60">
                        <span className="text-2xl md:text-3xl font-mono text-muted-foreground">
                            /{currentWord.PHON}/
                        </span>
                        {/* 
                         <span className="px-3 py-1 rounded-full border border-border text-lg font-medium text-muted-foreground uppercase">
                            {currentWord.SYNT}
                         </span>
                         */}
                    </div>
                </div>

            </div>

            {/* Footer Controls */}
            <div className="w-full pb-8 md:pb-12 px-4">
                <div className="max-w-md mx-auto flex items-center justify-between bg-white border border-border/40 shadow-xl rounded-full p-2 pl-6 pr-2 animate-fade-in delay-300 fill-mode-forwards opacity-0">

                    {/* Counter */}
                    <div className="text-sm font-medium text-muted-foreground font-mono">
                        <span className="text-foreground font-bold">{currentIndex + 1}</span>
                        <span className="mx-1">/</span>
                        {validWords.length}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrev}
                            disabled={currentIndex === 0}
                            className="h-10 w-10 rounded-full hover:bg-black/5 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Button>

                        <Button
                            variant="default" // Primary style for "Next"
                            size="icon"
                            onClick={handleNext}
                            disabled={currentIndex === validWords.length - 1} // Disable if end
                            className="h-10 w-10 rounded-full shadow-md disabled:opacity-30 disabled:bg-primary"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-4 opacity-50">
                    Utilisez les flèches du clavier pour naviguer • Echap pour quitter
                </p>
            </div>
        </div>
    );
}
