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
import { Download, BarChart3, RotateCcw, FilePlus, Square, ArrowRight, ArrowLeft, List, Type, ImageIcon, Layers, Info, Settings, Clock } from "lucide-react";

import { cn } from '@/lib/utils';
import { ExportPanel } from '@/components/export/ExportPanel';
import { NewListModal } from './NewListModal';
import { useToast } from "@/hooks/use-toast"
import { useSelection } from '@/contexts/SelectionContext';
import { useSavedListsContext } from '@/contexts/SavedListsContext';
import { CreateFailedListModal } from './CreateFailedListModal';
import { SaveListModal } from '@/components/saved-lists/SaveListModal';
import { SessionFinishModal } from './SessionFinishModal';
import { useEffect } from 'react';
import { PanelTopbar } from '@/components/ui/PanelTopbar';
import { PanelTabs, PanelTabsList, PanelTabsTrigger, PanelTabsContent } from '@/components/ui/PanelTabs';
import { SectionHeader } from '@/components/ui/SectionHeader';

type TabType = 'affichage' | 'aides';

export function SidePanel() {
    // Click-outside logic implemented
    const { isPanelOpen, setIsPanelOpen, panelMode, togglePanelMode, settings, updateSettings, queue, setQueue, currentIndex, setCurrentIndex, wordStatuses, cycleWordStatus, startTime, resetSession, setIsPlaying, setPhase, setHasStarted } = usePlayer();
    const [activeConfigTab, setActiveConfigTab] = useState<TabType>('affichage');
    const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
    const [isSaveListModalOpen, setIsSaveListModalOpen] = useState(false);
    const [showExportPanel, setShowExportPanel] = useState(false);
    const { toast } = useToast();
    const { clearSelection, addItems, setSelection, setIsFocusModeOpen } = useSelection();

    // Auto-open panel on mount with slide animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsPanelOpen(true);
        }, 150);
        return () => clearTimeout(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Guard: reset displayMode to 'wordOnly' if current mode needs images but queue has none
    const hasAnyImages = queue.some(w => w["image associée"]?.trim());
    useEffect(() => {
        if (!hasAnyImages && settings.displayMode !== 'wordOnly' && settings.displayMode !== 'alternateWordFirst') {
            updateSettings({ displayMode: 'wordOnly' });
        }
    }, [hasAnyImages]); // eslint-disable-line react-hooks/exhaustive-deps

    // Saved Lists Context
    const { saveList, savedLists } = useSavedListsContext();
    const [isFailedListModalOpen, setIsFailedListModalOpen] = useState(false);
    const [isSessionFinishModalOpen, setIsSessionFinishModalOpen] = useState(false);

    const failedWords = queue.filter(w => {
        const status = w.uid ? wordStatuses.get(w.uid) : undefined;
        return status === 'failed';
    });

    const handleCreateFailedList = () => {
        const skip = localStorage.getItem('skipFailedListConfirmation') === 'true';
        if (skip) {
            handleLaunchList();
        } else {
            setIsFailedListModalOpen(true);
        }
    };

    const handleLaunchList = () => {
        setIsFailedListModalOpen(false);

        // Capture count for toast
        const count = failedWords.length;

        // Update global selection to match failed words
        // This ensures Tachistoscope receives the correct 'words' prop
        // and its internal useEffect syncs the queue correctly.
        setSelection(failedWords);

        // Reset session state
        resetSession();

        // We don't strictly need to setQueue manually if Tachistoscope's useEffect works,
        // but setting it here ensures immediate state update before the prop propagates.
        // However, relying on prop propagation is safer to avoid race conditions 
        // with the useEffect in Tachistoscope.tsx that checks queue.length.
        // Let's let the sync mechanism handle it, but we force open the player.

        setPhase('display');

        toast({
            title: "Session lancée",
            description: `▶ ${count} mots ratés chargés dans le diaporama`,
            duration: 3000,
            className: "bg-[#F0EDFF] border-[#6C5CE7] text-[#6C5CE7]"
        });

        // Close panel to show player
        setIsPanelOpen(false);
    };

    const handleOpenSaveListModal = () => {
        setIsFailedListModalOpen(false);
        setIsSaveListModalOpen(true);
    };

    const handleSaveListConfirm = async (name: string, description: string, tags: string[], _saveAsNew?: boolean) => {
        console.log("Saving failed words list:", { name, count: failedWords.length, words: failedWords });
        const newListId = await saveList(name, description, failedWords, tags);
        setIsSaveListModalOpen(false);

        // If save was successful, load these words into the selection tray
        if (newListId) {
            // End session and return to config/selection
            resetSession();
            setSelection(failedWords); // Atomic replacement

            setIsFocusModeOpen(false);
            togglePanelMode('config');

            toast({
                title: "Liste chargée",
                description: `Les ${failedWords.length} mots ratés sont maintenant dans votre sélection.`,
                duration: 4000
            });
        }
    };

    const handleNewList = () => {
        setIsNewListModalOpen(true);
    };

    const handleNewListConfirm = () => {
        setIsFocusModeOpen(false); // Close Tachi first
        setIsNewListModalOpen(false);
        resetSession();
        // clearSelection needs to happen after we ensure we are exiting
        setTimeout(() => {
            clearSelection();
            setIsPanelOpen(true);
            togglePanelMode('config');
        }, 100);
    };

    const handleNewListExit = () => {
        setIsFocusModeOpen(false); // Close Tachi first
        setIsNewListModalOpen(false);
        resetSession();
        // clearSelection needs to happen after we ensure we are exiting
        setTimeout(() => {
            clearSelection();
            setIsPanelOpen(true);
            togglePanelMode('config');
        }, 100);
    };

    const handleConfirmFinishSession = () => {
        setIsSessionFinishModalOpen(true);
    };

    const handleQuitSession = () => {
        // Close tachistoscope first (same as clicking "← Retour" / X button)
        setIsFocusModeOpen(false);
        // Close the modal
        setIsSessionFinishModalOpen(false);
        // Send message to parent window to close the entire tool
        window.parent.postMessage({ type: 'close_tool' }, '*');
    };

    const handleViewRecap = () => {
        setIsSessionFinishModalOpen(false);
        togglePanelMode('stats');
        toast({
            title: "Récapitulatif",
            description: "Voici le résumé de votre session.",
            duration: 2000
        });
    };

    return (
        <>
            {/* BACKDROP - Always in DOM, animated with classes */}
            <div
                className={cn(
                    "fixed inset-0 z-[70] transition-opacity bg-background/0 cursor-default",
                    isPanelOpen
                        ? "opacity-100 duration-300 pointer-events-auto"
                        : "opacity-0 duration-0 pointer-events-none"
                )}
                onClick={() => setIsPanelOpen(false)}
            />

            {/* PANEL - Always in DOM, animated with classes */}
            <aside className={cn(
                "fixed right-0 top-0 h-screen bg-card border-l border-border flex flex-col overflow-hidden z-[80] shadow-2xl transition-all",
                isPanelOpen
                    ? "translate-x-0 opacity-100 duration-300 ease-in-out pointer-events-auto"
                    : "translate-x-full opacity-0 duration-0 pointer-events-none",
                panelMode === 'stats' ? "w-[520px]" : "w-[400px]"
            )}>
                {/* Harmonized Header */}
                <PanelTopbar
                    title={panelMode === 'config' ? 'Configuration' :
                        panelMode === 'stats' ? 'Statistiques' : 'Session en cours'}
                    icon={
                        panelMode === 'config'
                            ? <Settings className="w-3.5 h-3.5 text-[#6C5CE7]" />
                            : panelMode === 'session'
                                ? <span className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center"><Clock className="w-3 h-3 text-red-500" /></span>
                                : undefined
                    }
                    onClose={() => setIsPanelOpen(false)}
                    onBack={panelMode === 'stats' ? () => togglePanelMode('session') : undefined}
                />

                {/* MODE CONFIG */}
                {
                    panelMode === 'config' && (
                        <>
                            {/* Tabs + Content */}
                            <PanelTabs value={activeConfigTab} onValueChange={(v) => setActiveConfigTab(v as 'affichage' | 'aides')}>
                                <PanelTabsList>
                                    <PanelTabsTrigger value="affichage">Affichage</PanelTabsTrigger>
                                    <PanelTabsTrigger value="aides">Aides à la lecture</PanelTabsTrigger>
                                </PanelTabsList>

                                {/* ========== TAB: AFFICHAGE ========== */}
                                <PanelTabsContent value="affichage" className="px-5 py-6">
                                    <div className="space-y-2">
                                        {/* --- TYPOGRAPHIE --- */}
                                        <SectionHeader label="Typographie" />

                                        <Select
                                            value={settings.fontFamily}
                                            onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                                        >
                                            <SelectTrigger className="w-full bg-card text-sm font-medium text-foreground h-[48px] px-4 rounded-[10px] border-[1.5px] border-border hover:border-primary/30 transition-colors">
                                                <SelectValue placeholder="Choisir une police" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border z-[200]">
                                                <SelectItem value="arial">Arial</SelectItem>
                                                <SelectItem value="verdana">Verdana</SelectItem>
                                                <SelectItem value="mdi-ecole">MDI École</SelectItem>
                                                <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <div className="bg-muted p-4 rounded-[10px] space-y-3 border border-border">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[13px] font-medium text-foreground/70">Taille</span>
                                                <span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{settings.fontSize}x</span>
                                            </div>
                                            <Slider
                                                value={[settings.fontSize]}
                                                min={5}
                                                max={30}
                                                step={1}
                                                onValueChange={([v]) => updateSettings({ fontSize: v })}
                                                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                            />
                                        </div>

                                        {/* --- MODE D'AFFICHAGE --- */}
                                        <SectionHeader label="Mode d'affichage" className="mt-6" />

                                        {/* Content type cards */}
                                        {(() => {
                                            const wordsWithImages = queue.filter(w => w["image associée"]?.trim());
                                            const hasImages = wordsWithImages.length > 0;
                                            const allHaveImages = wordsWithImages.length === queue.length;
                                            const missingCount = queue.length - wordsWithImages.length;
                                            const rawContentMode = settings.displayMode === 'imageAndWord' ? 'both'
                                                : (settings.displayMode === 'image' || settings.displayMode === 'alternateImageFirst') ? 'image'
                                                : 'word';
                                            // Fallback to 'word' if current mode needs images but none available
                                            const contentMode = (!hasImages && rawContentMode !== 'word') ? 'word' : rawContentMode;
                                            const isDoubleFace = settings.displayMode === 'alternateWordFirst' || settings.displayMode === 'alternateImageFirst';

                                            const setContentMode = (mode: 'word' | 'image' | 'both') => {
                                                if (mode === 'both') {
                                                    updateSettings({ displayMode: 'imageAndWord' });
                                                } else if (mode === 'word') {
                                                    updateSettings({ displayMode: isDoubleFace ? 'alternateWordFirst' : 'wordOnly' });
                                                } else {
                                                    updateSettings({ displayMode: isDoubleFace ? 'alternateImageFirst' : 'image' });
                                                }
                                            };

                                            const toggleDoubleFace = () => {
                                                if (isDoubleFace) {
                                                    updateSettings({ displayMode: contentMode === 'image' ? 'image' : 'wordOnly' });
                                                } else {
                                                    updateSettings({ displayMode: contentMode === 'image' ? 'alternateImageFirst' : 'alternateWordFirst' });
                                                }
                                            };

                                            const cards = [
                                                { mode: 'word' as const, label: 'Mot', icon: Type, needsImage: false },
                                                { mode: 'image' as const, label: 'Image', icon: ImageIcon, needsImage: true },
                                                { mode: 'both' as const, label: 'Mot + Image', icon: Layers, needsImage: true },
                                            ];

                                            return (
                                                <>
                                                    <div className="flex gap-1.5">
                                                        {cards.map(({ mode, label, icon: Icon, needsImage }) => {
                                                            const disabled = needsImage && !hasImages;
                                                            const active = contentMode === mode;
                                                            return (
                                                                <button
                                                                    key={mode}
                                                                    onClick={() => !disabled && setContentMode(mode)}
                                                                    disabled={disabled}
                                                                    className={cn(
                                                                        "flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-[10px] border-[1.5px] transition-all relative",
                                                                        disabled
                                                                            ? "border-border/60 bg-muted/40 opacity-60 cursor-not-allowed"
                                                                            : active
                                                                                ? "border-primary bg-primary/[0.03] shadow-[0_0_0_1px_rgba(108,92,231,0.15)]"
                                                                                : "border-border bg-card hover:border-primary/30 hover:bg-[#FAFAFF] cursor-pointer"
                                                                    )}
                                                                >
                                                                    {/* Radio dot */}
                                                                    <div className={cn(
                                                                        "absolute top-2 right-2 w-3.5 h-3.5 rounded-full border-[1.5px] flex items-center justify-center transition-all",
                                                                        active ? "border-primary bg-primary" : "border-gray-300"
                                                                    )}>
                                                                        {active && <div className="w-[5px] h-[5px] rounded-full bg-white" />}
                                                                    </div>

                                                                    <div className={cn(
                                                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                                                        active ? "bg-primary/[0.12]" : "bg-primary/[0.06]"
                                                                    )}>
                                                                        <Icon className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <span className={cn(
                                                                        "text-[11.5px] font-semibold transition-colors",
                                                                        active ? "text-primary" : "text-foreground"
                                                                    )}>{label}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* No images / mixed list hint */}
                                                    {!hasImages && (
                                                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1.5">
                                                            <Info className="w-3 h-3 flex-shrink-0" />
                                                            Aucune image dans cette liste
                                                        </p>
                                                    )}
                                                    {hasImages && !allHaveImages && contentMode !== 'word' && (
                                                        <p className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-1.5">
                                                            <Info className="w-3 h-3 flex-shrink-0" />
                                                            {missingCount} mot{missingCount > 1 ? 's' : ''} sans image — {missingCount > 1 ? 'ils' : 'il'} s'afficher{missingCount > 1 ? 'ont' : 'a'} en texte seul
                                                        </p>
                                                    )}

                                                    {/* Double face toggle */}
                                                    {contentMode !== 'both' && hasImages && (
                                                        <div
                                                            onClick={toggleDoubleFace}
                                                            className="flex items-center justify-between p-3 bg-muted rounded-[10px] border border-border mt-2 cursor-pointer transition-colors hover:bg-[#e8eaf0]"
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <span className="text-[16px]">🃏</span>
                                                                <div>
                                                                    <div className="text-[13px] font-semibold text-foreground">Double face</div>
                                                                    <div className="text-[10.5px] text-muted-foreground">
                                                                        {contentMode === 'image' ? 'Le mot se dévoile au toucher' : "L'image se dévoile au toucher"}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={isDoubleFace}
                                                                onCheckedChange={toggleDoubleFace}
                                                                className="data-[state=checked]:bg-primary"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        {/* --- RYTHME D'AFFICHAGE --- */}
                                        <SectionHeader label="Rythme d'affichage" className="mt-6" />

                                        <div className="bg-muted p-4 rounded-[10px] space-y-3 border border-border">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[13px] font-medium text-foreground/70">Durée d'affichage</span>
                                                <span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{(settings.speedMs / 1000).toFixed(1)}s</span>
                                            </div>
                                            <Slider
                                                value={[settings.speedMs]}
                                                min={100}
                                                max={5000}
                                                step={100}
                                                onValueChange={([v]) => updateSettings({ speedMs: v })}
                                                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                            />
                                        </div>

                                        <div className="bg-muted p-4 rounded-[10px] space-y-3 border border-border">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[13px] font-medium text-foreground/70">Pause entre les mots</span>
                                                <span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{(settings.gapMs / 1000).toFixed(1)}s</span>
                                            </div>
                                            <Slider
                                                value={[settings.gapMs]}
                                                min={100}
                                                max={5000}
                                                step={100}
                                                onValueChange={([v]) => updateSettings({ gapMs: v })}
                                                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                            />
                                        </div>
                                    </div>
                                </PanelTabsContent>

                                {/* ========== TAB: AIDES À LA LECTURE ========== */}
                                <PanelTabsContent value="aides" className="px-5 py-6">
                                    <div className="space-y-2">
                                        {/* --- ESPACEMENTS --- */}
                                        <SectionHeader label="Espacements" />

                                        {/* Spacing mode visual cards */}
                                        <div className="flex flex-col gap-2">
                                            {([
                                                { value: 'letters', label: 'Lettres', desc: 'Espace entre chaque lettre', preview: 'c h a t o n' },
                                                { value: 'graphemes', label: 'Graphèmes', desc: 'Regroupe les sons écrits', preview: 'ch  a  t  on' },
                                                { value: 'syllables', label: 'Syllabes', desc: 'Découpe syllabique du mot', preview: 'cha  ton' },
                                            ] as const).map((mode) => (
                                                <div
                                                    key={mode.value}
                                                    onClick={() => updateSettings({ spacingMode: mode.value })}
                                                    className={cn(
                                                        "flex items-center gap-3 p-3 rounded-[10px] border-[1.5px] cursor-pointer transition-all",
                                                        settings.spacingMode === mode.value
                                                            ? "border-primary bg-primary/[0.03] shadow-[0_0_0_1px_rgba(108,92,231,0.15)]"
                                                            : "border-border bg-card hover:border-primary/30 hover:bg-[#FAFAFF]"
                                                    )}
                                                >
                                                    {/* Radio dot */}
                                                    <div className={cn(
                                                        "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                                                        settings.spacingMode === mode.value
                                                            ? "border-primary bg-primary"
                                                            : "border-gray-300 bg-white"
                                                    )}>
                                                        {settings.spacingMode === mode.value && (
                                                            <div className="w-[6px] h-[6px] rounded-full bg-white" />
                                                        )}
                                                    </div>

                                                    {/* Text */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className={cn(
                                                            "text-[13px] font-semibold mb-0.5 transition-colors",
                                                            settings.spacingMode === mode.value ? "text-primary" : "text-foreground"
                                                        )}>{mode.label}</div>
                                                        <div className="text-[10.5px] text-muted-foreground">{mode.desc}</div>
                                                    </div>

                                                    {/* Visual preview */}
                                                    <div className="text-[13px] font-semibold text-primary bg-primary/[0.06] px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0 font-mono">
                                                        {mode.preview}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Écart slider */}
                                        <div className="bg-muted p-4 rounded-[10px] space-y-3 border border-border/40 mt-2">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[13px] font-medium text-foreground/70">Écart</span>
                                                <span className="text-[15px] font-bold font-sora text-primary min-w-[60px] text-right">{(settings.spacingValue / 10).toFixed(1)}x</span>
                                            </div>
                                            <Slider
                                                value={[settings.spacingValue]}
                                                min={0}
                                                max={settings.spacingMode === 'letters' ? 30 : 20}
                                                step={1}
                                                onValueChange={([v]) => updateSettings({ spacingValue: v })}
                                                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-0 [&_[role=slider]]:h-[18px] [&_[role=slider]]:w-[18px] [&_[role=slider]]:shadow-md [&_.bg-primary]:bg-primary/15 h-1.5"
                                            />
                                        </div>

                                        {/* --- REPÈRES VISUELS --- */}
                                        <SectionHeader label="Repères visuels" className="mt-6" />

                                        <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] border border-border transition-colors hover:bg-[#e8eaf0]">
                                            <div className="flex-1 pr-4">
                                                <div className="text-sm font-semibold text-foreground mb-0.5">
                                                    Voyelles en couleur
                                                    <span className="inline-block ml-1.5 text-[9px] font-bold uppercase tracking-[0.05em] text-[#DC2626] bg-[#DC2626]/[0.08] px-1.5 py-0.5 rounded-[5px]">Rouge</span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">Coloration des voyelles pour faciliter le décodage</div>
                                            </div>
                                            <Switch
                                                checked={settings.highlightVowels}
                                                onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>

                                        <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] border border-border transition-colors hover:bg-[#e8eaf0]">
                                            <div className="flex-1 pr-4">
                                                <div className="text-sm font-semibold text-foreground mb-0.5">
                                                    Lettres muettes
                                                    <span className="inline-block ml-1.5 text-[9px] font-bold uppercase tracking-[0.05em] text-[#9CA3AF] bg-[#9CA3AF]/[0.12] px-1.5 py-0.5 rounded-[5px]">Gris</span>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">Atténuation visuelle des lettres non prononcées</div>
                                            </div>
                                            <Switch
                                                checked={settings.highlightSilent}
                                                onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>

                                        {/* --- GUIDAGE ATTENTIONNEL --- */}
                                        <SectionHeader label="Guidage attentionnel" className="mt-6" />

                                        <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] border border-border transition-colors hover:bg-[#e8eaf0]">
                                            <div className="flex-1 pr-4">
                                                <div className="text-sm font-semibold text-foreground mb-0.5">Point de fixation</div>
                                                <div className="text-[11px] text-muted-foreground">Croix centrée affichée pendant la pause</div>
                                            </div>
                                            <Switch
                                                checked={settings.showFocusPoint}
                                                onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>

                                        <div className="flex items-start justify-between p-3.5 bg-muted rounded-[10px] border border-border transition-colors hover:bg-[#e8eaf0]">
                                            <div className="flex-1 pr-4">
                                                <div className="text-sm font-semibold text-foreground mb-0.5">Signal sonore</div>
                                                <div className="text-[11px] text-muted-foreground">Bip avant l'affichage de chaque mot</div>
                                            </div>
                                            <Switch
                                                checked={settings.enableSound}
                                                onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        </div>
                                    </div>
                                </PanelTabsContent>
                            </PanelTabs>
                        </>
                    )}

                {/* MODE SESSION */}
                {
                    panelMode === 'session' && (
                        <>
                            {/* Stats */}
                            {(() => {
                                // Calculate statistics from wordStatuses
                                const totalWords = queue.filter(w => w.MOTS !== 'Bravo !').length;
                                const statusValues = Array.from(wordStatuses.values());
                                const validatedCount = statusValues.filter(s => s === 'validated').length;
                                const failedCount = statusValues.filter(s => s === 'failed').length;
                                const answeredCount = validatedCount + failedCount;
                                const successRate = answeredCount > 0 ? Math.round((validatedCount / answeredCount) * 100) : 0;

                                return (
                                    <div className="px-5 py-5 border-b border-border">
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
                            < div className="px-5 py-5 border-b border-border flex flex-col gap-2.5">
                                <Button
                                    className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto"
                                    onClick={() => setShowExportPanel(true)}
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Exporter</span>
                                </Button>
                                <Button
                                    className="w-full justify-between gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto group"
                                    onClick={() => togglePanelMode('stats')}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Voir statistiques</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </Button>
                                <Button
                                    className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto"
                                    onClick={() => resetSession()}
                                >
                                    < RotateCcw className="w-4 h-4" />
                                    < span > Relancer la liste</span >
                                </Button >
                                <Button
                                    className="w-full justify-start gap-2.5 px-4 py-3 border-[1.5px] border-border bg-card text-foreground text-[13px] font-semibold rounded-[10px] hover:bg-muted hover:border-primary hover:text-primary transition-all h-auto"
                                    onClick={handleNewList}
                                >
                                    < FilePlus className="w-4 h-4" />
                                    < span > Nouvelle liste</span >
                                </Button >
                            </div >

                            {/* Word List */}
                            < div className="flex-1 overflow-y-auto px-5 py-5">
                                < div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3.5">
                                    Liste des mots({queue.length})
                                </div >
                                <div className="space-y-2">
                                    {
                                        queue.filter(word => word.MOTS !== 'Bravo !').map((word, index) => {
                                            const status = index === currentIndex ? 'current' : (word.uid ? wordStatuses.get(word.uid) || 'neutral' : 'neutral');
                                            const isClickable = status !== 'current';

                                            return (
                                                <div
                                                    key={word.uid || index}
                                                    className={cn(
                                                        "flex items-center gap-3.5 px-3.5 py-2.5 bg-muted rounded-[10px] text-sm border-l-[3px] cursor-pointer transition-all",
                                                        "word-list-item",
                                                        status
                                                    )}
                                                    onClick={() => isClickable && word.uid && cycleWordStatus(word.uid)}
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
                                                        {word.MOTS}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div >

                            {/* Footer */}
                            < div className="px-5 py-5 border-t border-border space-y-3">
                                {failedWords.length > 0 && (
                                    <button
                                        onClick={handleCreateFailedList}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#C4B8FF] bg-[#F8F6FF] text-[#6C5CE7] font-dm-sans text-[14px] font-semibold hover:bg-[#EDEAFF] hover:border-[#6C5CE7] transition-all duration-200"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                        Créer liste des mots ratés
                                    </button>
                                )}
                                < Button
                                    className="w-full justify-center gap-2 px-5 py-3.5 bg-destructive text-white text-[15px] font-bold font-sora rounded-[14px] hover:bg-destructive/90 transition-all h-auto"
                                    onClick={handleConfirmFinishSession}
                                >
                                    < Square className="w-4 h-4" />
                                    Terminer la session
                                </Button >
                            </div >
                        </>
                    )
                }

                {/* MODE STATS */}
                {
                    panelMode === 'stats' && (
                        <div className="flex-1 overflow-y-auto px-5 py-6">
                            {(() => {
                                const visualQueue = queue.filter(w => w.MOTS !== 'Bravo !');
                                // Calculate stats
                                const totalWords = visualQueue.length;
                                const validatedCount = Array.from(wordStatuses.values()).filter(s => s === 'validated').length;
                                const failedCount = Array.from(wordStatuses.values()).filter(s => s === 'failed').length;
                                const answeredCount = validatedCount + failedCount;
                                const successRate = answeredCount > 0 ? Math.round((validatedCount / answeredCount) * 100) : 0;

                                // Calculate duration
                                const now = Date.now();
                                const durationMs = startTime ? now - startTime : 0;
                                const durationSeconds = Math.floor(durationMs / 1000);
                                const minutes = Math.floor(durationSeconds / 60);
                                const seconds = durationSeconds % 60;
                                const durationText = `${minutes}m ${seconds}s`;

                                return (
                                    <>
                                        {/* Résumé global */}
                                        <div className="mb-8">
                                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <BarChart3 className="w-3.5 h-3.5" />
                                                Résumé global
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="bg-muted p-5 rounded-[10px] text-center">
                                                    <div className="text-[32px] font-bold font-sora text-primary mb-1.5 leading-none">{validatedCount}/{totalWords}</div>
                                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Réussis</div>
                                                </div>
                                                <div className="bg-muted p-5 rounded-[10px] text-center">
                                                    <div className="text-[32px] font-bold font-sora text-primary mb-1.5 leading-none">{successRate}%</div>
                                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Taux</div>
                                                </div>
                                                <div className="bg-muted p-5 rounded-[10px] text-center">
                                                    <div className="text-[32px] font-bold font-sora text-primary mb-1.5 leading-none leading-tight tracking-tight whitespace-nowrap text-[28px]">{durationText}</div>
                                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wide">Durée</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Détail par mot */}
                                        <div className="mb-8">
                                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <List className="w-3.5 h-3.5" />
                                                Détail par mot
                                            </div>
                                            <div className="space-y-2">
                                                {visualQueue.map((word, index) => {
                                                    const status = word.uid ? wordStatuses.get(word.uid) || 'neutral' : 'neutral';

                                                    return (
                                                        <div
                                                            key={index}
                                                            className={cn(
                                                                "flex items-center gap-3.5 px-4 py-3 bg-muted rounded-[10px] border-l-[3px]",
                                                                status === 'validated' ? "bg-emerald-400/10 border-emerald-400" :
                                                                    status === 'failed' ? "bg-rose-400/10 border-rose-400" :
                                                                        "border-transparent"
                                                            )}
                                                        >
                                                            <span className={cn(
                                                                "text-xs font-bold font-sora min-w-[28px]",
                                                                status === 'validated' ? "text-emerald-500" :
                                                                    status === 'failed' ? "text-rose-500" :
                                                                        "text-muted-foreground"
                                                            )}>
                                                                {String(index + 1).padStart(2, '0')}
                                                            </span>
                                                            <span className="flex-1 text-[15px] font-medium text-foreground">
                                                                {word.MOTS}
                                                            </span>
                                                            <div className={cn(
                                                                "w-6 h-6 rounded-full flex items-center justify-center text-sm",
                                                                status === 'validated' ? "bg-emerald-400 text-white" :
                                                                    status === 'failed' ? "bg-rose-400 text-white" :
                                                                        "bg-slate-200 text-muted-foreground"
                                                            )}>
                                                                {status === 'validated' ? "✓" : status === 'failed' ? "✗" : "—"}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Export */}
                                        <div className="pt-5 border-t border-border">
                                            <Button
                                                className="w-full justify-center gap-2 px-5 py-3.5 bg-primary text-white text-[15px] font-bold font-sora rounded-[14px] hover:bg-primary/90 transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.35)] hover:-translate-y-px h-auto"
                                                onClick={() => setShowExportPanel(true)}
                                            >
                                                <Download className="w-4.5 h-4.5" />
                                                Exporter
                                            </Button>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    )
                }

                <NewListModal
                    isOpen={isNewListModalOpen}
                    onClose={() => setIsNewListModalOpen(false)}
                    onDownloadAndContinue={handleNewListConfirm}
                    onContinueWithoutSaving={handleNewListExit}
                />

                <CreateFailedListModal
                    isOpen={isFailedListModalOpen}
                    onClose={() => setIsFailedListModalOpen(false)}
                    onLaunch={handleLaunchList}
                    onSave={handleOpenSaveListModal}
                    failedWords={failedWords}
                />

                <SaveListModal
                    isOpen={isSaveListModalOpen}
                    onClose={() => setIsSaveListModalOpen(false)}
                    onSave={handleSaveListConfirm}
                    words={failedWords}
                    mode="create"
                    existingLists={savedLists.map(l => ({ id: l.id, name: l.name }))}
                    initialData={{
                        name: `Mots à retravailler — ${new Date().toLocaleDateString('fr-FR')}`,
                        description: "Liste générée automatiquement depuis les mots ratés",
                        tags: ['ratés']
                    }}
                />

                <SessionFinishModal
                    isOpen={isSessionFinishModalOpen}
                    onClose={() => setIsSessionFinishModalOpen(false)}
                    stats={(() => {
                        const visualQueue = queue.filter(w => w.MOTS !== 'Bravo !');
                        const totalCount = visualQueue.length;
                        const validatedCount = Array.from(wordStatuses.values()).filter(s => s === 'validated').length;
                        const failedCount = Array.from(wordStatuses.values()).filter(s => s === 'failed').length;
                        const answeredCount = validatedCount + failedCount;
                        const successRate = answeredCount > 0 ? Math.round((validatedCount / answeredCount) * 100) : 0;

                        return {
                            successCount: validatedCount,
                            totalCount,
                            successRate
                        };
                    })()}
                    onQuit={handleQuitSession}
                    onViewRecap={handleViewRecap}
                />
            </aside >

            {showExportPanel && (
                <div className="relative z-[80]">
                    <ExportPanel
                        selectedWords={queue.filter(w => w.MOTS !== 'Bravo !')}
                        wordStatuses={wordStatuses}
                        currentIndex={currentIndex}
                        onClose={() => setShowExportPanel(false)}
                    />
                </div>
            )}
        </>
    );
}
