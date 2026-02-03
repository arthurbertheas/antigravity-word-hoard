import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download, BarChart3, RotateCcw, FilePlus, Square } from "lucide-react";
import { cn } from '@/lib/utils';

type TabType = 'visual' | 'timing' | 'focus' | 'sound';

export function SidePanel() {
    const { isPanelOpen, panelMode, settings, updateSettings, queue, currentIndex, wordStatuses, cycleWordStatus } = usePlayer();
    const [activeTab, setActiveTab] = useState<TabType>('visual');

    if (!isPanelOpen) return null;

    const tabs: { id: TabType; label: string }[] = [
        { id: 'visual', label: 'Visuel' },
        { id: 'timing', label: 'Timing' },
        { id: 'focus', label: 'Focus' },
        { id: 'sound', label: 'Son' },
    ];

    return (
        <aside className="fixed right-0 top-0 h-screen w-[360px] bg-card border-l border-border flex flex-col overflow-hidden z-40 shadow-2xl">
            {/* Header */}
            <div className="px-8 py-7 pb-6 border-b border-border">
                < div className="text-lg font-bold font-sora text-foreground mb-1">
                    {panelMode === 'config' ? 'Configuration' : 'Session en cours'}
                </div >
                <div className="text-xs text-muted-foreground">
                    {panelMode === 'config' ? 'Réglages d\'affichage' : 'Liste et actions'}
                </div >
            </div >

            {/* MODE CONFIG */}
            {
                panelMode === 'config' && (
                    <>
                        {/* Tabs */}
                        <div className="px-8 py-5 pb-4 border-b border-border">
                            <div className="flex gap-1.5 p-1 bg-muted rounded-[10px]">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200",
                                            activeTab === tab.id
                                                ? "bg-card text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tab.label}
                                    </button >
                                ))
                                }
                            </div >
                        </div >

                        {/* Content */}
                        < div className="flex-1 overflow-y-auto px-8 py-6">
                            {
                                activeTab === 'visual' && (
                                    <div className="space-y-7">
                                        < div className="space-y-3.5">
                                            < label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Typographie</label>
                                            < Select
                                                value={settings.fontFamily}
                                                onValueChange={(v: any) => updateSettings({ fontFamily: v })
                                                }
                                            >
                                                <SelectTrigger className="w-full bg-card text-sm font-medium text-foreground h-[52px] px-4 rounded-[10px] border-[1.5px] border-border hover:border-primary/30 transition-colors">
                                                    < SelectValue placeholder="Choisir une police" />
                                                </SelectTrigger >
                                                <SelectContent className="bg-card border-border z-[200]">
                                                    < SelectItem value="arial">Arial</SelectItem>
                                                    < SelectItem value="verdana">Verdana</SelectItem>
                                                    < SelectItem value="mdi-ecole">MDI École</SelectItem>
                                                    < SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                                                </SelectContent >
                                            </Select >
                                        </div >

                                        <div className="space-y-3.5">
                                            < label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Taille et Espacement</label>
                                            < div className="bg-muted p-4 rounded-[10px] space-y-3">
                                                < div className="flex justify-between items-center mb-3">
                                                    < span className="text-[13px] font-medium text-muted-foreground">Zoom</span>
                                                    < span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{settings.fontSize}x</span>
                                                </div >
                                                <Slider
                                                    value={[settings.fontSize]}
                                                    min={5}
                                                    max={30}
                                                    step={1}
                                                    onValueChange={([v]) => updateSettings({ fontSize: v })}
                                                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                                />
                                            </div >
                                            <div className="bg-muted p-4 rounded-[10px] space-y-3">
                                                < div className="flex justify-between items-center mb-3">
                                                    < span className="text-[13px] font-medium text-muted-foreground">Espacement</span>
                                                    < span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{settings.letterSpacing}px</span>
                                                </div >
                                                <Slider
                                                    value={[settings.letterSpacing]}
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                    onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                                                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                                />
                                            </div >
                                        </div >
                                    </div >
                                )
                            }

                            {
                                activeTab === 'timing' && (
                                    <div className="space-y-7">
                                        < div className="space-y-3.5">
                                            < label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Durées d'affichage</label>
                                            < div className="bg-muted p-4 rounded-[10px] space-y-3">
                                                < div className="flex justify-between items-center mb-3">
                                                    < span className="text-[13px] font-medium text-muted-foreground">Exposition</span>
                                                    < span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{(settings.speedMs / 1000).toFixed(1)}s</span>
                                                </div >
                                                <Slider
                                                    value={[settings.speedMs]}
                                                    min={100}
                                                    max={5000}
                                                    step={100}
                                                    onValueChange={([v]) => updateSettings({ speedMs: v })}
                                                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                                />
                                            </div >
                                            <div className="bg-muted p-4 rounded-[10px] space-y-3">
                                                < div className="flex justify-between items-center mb-3">
                                                    < span className="text-[13px] font-medium text-muted-foreground">Pause inter-mots</span>
                                                    < span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{(settings.gapMs / 1000).toFixed(1)}s</span>
                                                </div >
                                                <Slider
                                                    value={[settings.gapMs]}
                                                    min={100}
                                                    max={5000}
                                                    step={100}
                                                    onValueChange={([v]) => updateSettings({ gapMs: v })}
                                                    className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                                />
                                            </div >
                                        </div >
                                    </div >
                                )
                            }

                            {
                                activeTab === 'focus' && (
                                    <div className="space-y-7">
                                        < div className="space-y-3.5">
                                            < label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Mise en avant</label>
                                            < div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] transition-colors hover:bg-[#e8eaf0]">
                                                < div className="flex-1 pr-4">
                                                    < div className="text-sm font-semibold text-foreground mb-0.5">Voyelles</div>
                                                    < div className="text-[11px] text-muted-foreground">Coloration rouge</div>
                                                </div >
                                                <Switch
                                                    checked={settings.highlightVowels}
                                                    onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div >
                                            <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] transition-colors hover:bg-[#e8eaf0]">
                                                < div className="flex-1 pr-4">
                                                    < div className="text-sm font-semibold text-foreground mb-0.5">Lettres Muettes</div>
                                                    < div className="text-[11px] text-muted-foreground">Coloration grise</div>
                                                </div >
                                                <Switch
                                                    checked={settings.highlightSilent}
                                                    onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div >
                                            <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] transition-colors hover:bg-[#e8eaf0]">
                                                < div className="flex-1 pr-4">
                                                    < div className="text-sm font-semibold text-foreground mb-0.5">Point de Fixation</div>
                                                    < div className="text-[11px] text-muted-foreground">Afficher pendant pause</div>
                                                </div >
                                                <Switch
                                                    checked={settings.showFocusPoint}
                                                    onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div >
                                        </div >
                                    </div >
                                )
                            }

                            {
                                activeTab === 'sound' && (
                                    <div className="space-y-7">
                                        < div className="space-y-3.5">
                                            < label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Feedback audio</label>
                                            < div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] transition-colors hover:bg-[#e8eaf0]">
                                                < div className="flex-1 pr-4">
                                                    < div className="text-sm font-semibold text-foreground mb-0.5">Son</div>
                                                    < div className="text-[11px] text-muted-foreground">Bip à chaque mot</div>
                                                </div >
                                                <Switch
                                                    checked={settings.enableSound}
                                                    onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                                    className="data-[state=checked]:bg-primary"
                                                />
                                            </div >
                                        </div >
                                    </div >
                                )
                            }
                        </div >
                    </>
                )}

            {/* MODE SESSION */}
            {
                panelMode === 'session' && (
                    <>
                        {/* Stats */}
                        {(() => {
                            // Calculate statistics from wordStatuses
                            const totalWords = queue.filter(w => w.ORTHO !== 'FIN').length;
                            const validatedCount = Array.from(wordStatuses.values()).filter(s => s === 'validated').length;
                            const failedCount = Array.from(wordStatuses.values()).filter(s => s === 'failed').length;
                            const answeredCount = validatedCount + failedCount;
                            const successRate = answeredCount > 0 ? Math.round((validatedCount / answeredCount) * 100) : 0;

                            return (
                                <div className="px-8 py-5 border-b border-border">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-muted p-3.5 rounded-[10px] text-center">
                                            <div className="text-2xl font-bold font-sora text-primary mb-1">{validatedCount}<span className="text-lg text-muted-foreground font-medium">/{totalWords}</span></div>
                                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Succès</div>
                                        </div>
                                        <div className="bg-muted p-3.5 rounded-[10px] text-center">
                                            <div className="text-2xl font-bold font-sora text-primary mb-1">{successRate}%</div>
                                            <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Taux</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Actions */}
                        < div className="px-8 py-5 border-b border-border flex flex-col gap-2.5">
                            < Button className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto">
                                < Download className="w-4 h-4" />
                                < span > Enregistrer PDF</span >
                            </Button >
                            <Button className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto">
                                < BarChart3 className="w-4 h-4" />
                                < span > Voir statistiques</span >
                            </Button >
                            <Button className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto">
                                < RotateCcw className="w-4 h-4" />
                                < span > Relancer la liste</span >
                            </Button >
                            <Button className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto">
                                < FilePlus className="w-4 h-4" />
                                < span > Nouvelle liste</span >
                            </Button >
                        </div >

                        {/* Word List */}
                        < div className="flex-1 overflow-y-auto px-8 py-5">
                            < div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
                                Liste des mots({queue.length})
                            </div >
                            <div className="space-y-2">
                                {
                                    queue.filter(word => word.ORTHO !== 'FIN').map((word, index) => {
                                        const status = index === currentIndex ? 'current' : (wordStatuses.get(index) || 'neutral');
                                        const isClickable = status !== 'current';

                                        return (
                                            <div
                                                key={index}
                                                className={cn(
                                                    "flex items-center gap-3 px-3.5 py-2.5 bg-muted rounded-[10px] text-sm border-l-[3px] cursor-pointer transition-all",
                                                    "word-list-item",
                                                    status
                                                )}
                                                onClick={() => isClickable && cycleWordStatus(index)}
                                            >
                                                <span className={cn(
                                                    "text-[11px] font-bold font-sora min-w-[24px]",
                                                    status === 'current' ? "text-primary" :
                                                        status === 'validated' ? "text-[#6ee7b7]" :
                                                            status === 'failed' ? "text-[#f87171]" :
                                                                "text-muted-foreground"
                                                )}>
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <span className={cn(
                                                    "flex-1 font-medium",
                                                    status === 'current' ? "text-primary font-semibold" : "text-muted-foreground"
                                                )}>
                                                    {word.ORTHO}
                                                </span>
                                            </div>
                                        );
                                    })
                                }
                            </div >
                        </div >

                        {/* Footer */}
                        < div className="px-8 py-5 border-t border-border">
                            < Button className="w-full justify-center gap-2 px-5 py-3.5 bg-destructive text-white text-[15px] font-bold font-sora rounded-[14px] hover:bg-destructive/90 transition-all h-auto">
                                < Square className="w-4 h-4" />
                                Terminer la session
                            </Button >
                        </div >
                    </>
                )
            }
        </aside >
    );
}

