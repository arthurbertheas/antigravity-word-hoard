import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FeedbackType = 'success' | 'error';

interface FeedbackBadgeProps {
    feedback: { type: FeedbackType; id: number } | null;
}

export function FeedbackBadge({ feedback }: FeedbackBadgeProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState<FeedbackType | null>(null);

    useEffect(() => {
        if (feedback) {
            setIsVisible(true);
            setCurrentFeedback(feedback.type);

            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 800);

            return () => clearTimeout(timer);
        }
    }, [feedback]);

    if (!currentFeedback && !isVisible) return null;

    return (
        <div
            className={cn(
                "fixed bottom-32 left-1/2 -translate-x-1/2 z-[70] pointer-events-none transition-all duration-300 ease-out flex items-center gap-2",
                "bg-neutral-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/5",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
        >
            {currentFeedback === 'success' ? (
                <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-white">Validé</span>
                </>
            ) : (
                <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-medium text-white">À revoir</span>
                </>
            )}
        </div>
    );
}
