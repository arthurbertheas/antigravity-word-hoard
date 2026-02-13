// SessionFinishModal - Modal displayed when tachistoscope session ends
import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface SessionFinishModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: {
        successCount: number;
        totalCount: number;
        successRate: number;
    };
    onQuit: () => void;
    onViewRecap: () => void;
}

export function SessionFinishModal({
    isOpen,
    onClose,
    stats,
    onQuit,
    onViewRecap
}: SessionFinishModalProps) {
    const { successCount, totalCount, successRate } = stats;

    // Trigger confetti when modal opens
    useEffect(() => {
        if (!isOpen) return;

        const duration = 3 * 1000; // 3 seconds
        const animationEnd = Date.now() + duration;
        const defaults = {
            startVelocity: 30,
            spread: 360,
            ticks: 60,
            zIndex: 9999
        };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Left cannon
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });

            // Right cannon
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        return () => clearInterval(interval);
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className={cn(
                    "sm:max-w-[380px] p-8 !rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.15)]",
                    "border-none bg-white",
                    "data-[state=open]:animate-in data-[state=closed]:animate-out",
                    "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
                    "data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
                    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
                    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]"
                )}
                style={{
                    borderRadius: '20px',
                    width: '380px',
                    maxWidth: '92vw',
                    padding: '32px 28px',
                    gap: '0'
                }}
            >
                {/* Content Container */}
                <div className="flex flex-col items-center text-center">

                    {/* Icon */}
                    <div className="w-[44px] h-[44px] rounded-full bg-[#E8FBF5] flex items-center justify-center mb-5">
                        <Check className="w-6 h-6 text-[#00B894]" strokeWidth={3} />
                    </div>

                    {/* Title */}
                    <h2 className="text-[17px] font-bold font-sora text-[#1A1A2E] mb-2 leading-tight">
                        Session terminée 🎉
                    </h2>

                    {/* Stats */}
                    <p className="text-[15px] font-medium font-['DM_Sans'] text-[#6B7280] mb-6">
                        {successCount}/{totalCount} réussis · {successRate}%
                    </p>

                    {/* Actions */}
                    <div className="flex w-full gap-[10px] mt-2">
                        <Button
                            variant="outline"
                            onClick={onViewRecap}
                            className={cn(
                                "flex-1 h-auto py-[11px] px-[22px]",
                                "border-[1.5px] border-[#6C5CE7] bg-white",
                                "text-[#6C5CE7] text-[14px] font-semibold font-['DM_Sans']",
                                "rounded-[10px] hover:bg-[#6C5CE7]/5 hover:text-[#6C5CE7] transition-colors"
                            )}
                        >
                            Voir le récap 📊
                        </Button>
                        <Button
                            onClick={onQuit}
                            className={cn(
                                "flex-1 h-auto py-[11px] px-[22px]",
                                "bg-[#6C5CE7] text-white",
                                "text-[14px] font-semibold font-['DM_Sans']",
                                "rounded-[10px] shadow-[0_3px_10px_rgba(108,92,231,0.3)]",
                                "hover:bg-[#5a4ad1] transition-all hover:shadow-[0_5px_15px_rgba(108,92,231,0.4)]"
                            )}
                        >
                            Quitter
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
