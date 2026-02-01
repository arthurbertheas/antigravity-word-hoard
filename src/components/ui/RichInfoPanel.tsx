import React, { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from '@/lib/utils';

interface RichPanelProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    heroImage?: string;
    slogan?: string;
    items: Array<{
        icon: ReactNode;
        title: string;
        description: string;
    }>;
    actionButton?: {
        label: string;
        onClick: () => void;
    };
}

export function RichInfoPanel({
    isOpen,
    onClose,
    title,
    heroImage,
    slogan,
    items,
    actionButton
}: RichPanelProps) {
    return (
        <aside
            className={cn(
                "fixed inset-y-0 right-0 z-[200] w-[400px] bg-neutral-800 shadow-2xl transition-transform duration-500 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}
        >
            {/* Header */}
            <div className="relative p-6 lg:p-8 pb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                    onClick={onClose}
                >
                    <X className="w-6 h-6" />
                </Button>
                <h2 className="text-xl font-bold text-white pr-8 uppercase tracking-wide">
                    {title}
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-6 lg:px-8 pb-8">
                {/* Zone Hero */}
                {heroImage && (
                    <div className="w-full h-48 bg-neutral-700 rounded-xl mb-8 overflow-hidden">
                        <img
                            src={heroImage}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                {/* Content Slogan */}
                {slogan && (
                    <h3 className="text-lg font-bold text-white mb-6 leading-tight">
                        {slogan}
                    </h3>
                )}

                {/* Features List */}
                <div className="space-y-6">
                    {items.map((item, index) => (
                        <div key={index} className="flex items-start gap-4">
                            <div className="mt-1 text-emerald-400 flex-shrink-0">
                                {item.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-base">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            {actionButton && (
                <div className="p-6 lg:p-8 border-t border-white/5">
                    <Button
                        className="w-full py-6 rounded-xl font-bold bg-white text-neutral-900 hover:bg-neutral-100 transition-all text-base shadow-lg"
                        onClick={actionButton.onClick}
                    >
                        {actionButton.label}
                    </Button>
                </div>
            )}
        </aside>
    );
}
