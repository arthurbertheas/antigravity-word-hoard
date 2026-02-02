import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Settings2, Type, Zap, Timer, MousePointer2, Volume2 } from "lucide-react";
import { cn } from '@/lib/utils';

type TabType = 'display' | 'timing' | 'highlight' | 'advanced';

export function SettingsPopover() {
    const { settings, updateSettings } = usePlayer();
    const [activeTab, setActiveTab] = useState<TabType>('display');

    const tabs: { id: TabType; label: string }[] = [
        { id: 'display', label: 'Affichage' },
        { id: 'timing', label: 'Timing' },
        { id: 'highlight', label: 'Exergue' },
        { id: 'advanced', label: 'Avancé' },
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0 bg-[#171717] border border-white/10 shadow-2xl rounded-2xl z-[110] overflow-hidden"
                side="top"
                align="end"
                sideOffset={20}
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-white/5">
                    <h3 className="text-lg font-bold text-white leading-tight">
                        Paramètres de lecture
                    </h3>
                    <p className="text-sm text-neutral-400 mt-1">
                        Personnalisez votre expérience
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="px-4 pt-4">
                    <div className="flex items-center gap-1 p-1 bg-neutral-900/50 rounded-xl border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                                    activeTab === tab.id
                                        ? "bg-neutral-800 text-white shadow-lg ring-1 ring-white/10"
                                        : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 min-h-[280px]">
                    {activeTab === 'display' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* Typography Section */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                                            TYPOGRAPHIE
                                        </Label>
                                        <span className="text-white text-[10px] font-mono uppercase opacity-50">
                                            {settings.fontFamily}
                                        </span>
                                    </div>
                                    <Select
                                        value={settings.fontFamily}
                                        onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                                    >
                                        <SelectTrigger className="w-full h-10 bg-neutral-900 border-neutral-800 text-white text-xs hover:border-neutral-700 transition-colors rounded-xl">
                                            <SelectValue placeholder="Choisir une police" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-neutral-900 border-neutral-800 text-white z-[150]">
                                            <SelectItem value="arial" className="focus:bg-neutral-800 focus:text-white">Arial</SelectItem>
                                            <SelectItem value="verdana" className="focus:bg-neutral-800 focus:text-white">Verdana</SelectItem>
                                            <SelectItem value="mdi-ecole" className="focus:bg-neutral-800 focus:text-white">MDI École</SelectItem>
                                            <SelectItem value="opendyslexic" className="focus:bg-neutral-800 focus:text-white">OpenDyslexic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-5 pt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">TAILLE ET ESPACEMENT</Label>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-neutral-500 font-medium">Zoom</span>
                                            <span className="text-white text-[11px] font-mono">{settings.fontSize}</span>
                                        </div>
                                        <Slider
                                            value={[settings.fontSize]}
                                            min={5}
                                            max={30}
                                            step={1}
                                            onValueChange={([v]) => updateSettings({ fontSize: v })}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/10"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-neutral-500 font-medium">Espacement</span>
                                            <span className="text-white text-[11px] font-mono">{settings.letterSpacing}px</span>
                                        </div>
                                        <Slider
                                            value={[settings.letterSpacing]}
                                            min={0}
                                            max={40}
                                            step={1}
                                            onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timing' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="space-y-6">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">DURÉES</Label>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-neutral-500 font-medium">Exposition</span>
                                            <span className="text-white text-[11px] font-mono">{(settings.speedMs / 1000).toFixed(1)} s</span>
                                        </div>
                                        <Slider
                                            value={[settings.speedMs]}
                                            min={100}
                                            max={5000}
                                            step={100}
                                            onValueChange={([v]) => updateSettings({ speedMs: v })}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/10"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-neutral-500 font-medium">Pause Inter-mots</span>
                                            <span className="text-white text-[11px] font-mono">{(settings.gapMs / 1000).toFixed(1)} s</span>
                                        </div>
                                        <Slider
                                            value={[settings.gapMs]}
                                            min={100}
                                            max={5000}
                                            step={100}
                                            onValueChange={([v]) => updateSettings({ gapMs: v })}
                                            className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-white/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'highlight' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">MISE EN AVANT</Label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-[12px] text-white font-medium">Voyelles</p>
                                        <p className="text-[10px] text-neutral-500">Coloration rouge</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightVowels}
                                        onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-[12px] text-white font-medium">Lettres Muettes</p>
                                        <p className="text-[10px] text-neutral-500">Coloration grise</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightSilent}
                                        onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'advanced' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">OPTIONS DIVERSES</Label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-[12px] text-white font-medium">Point de Fixation</p>
                                        <p className="text-[10px] text-neutral-500">Afficher + pendant pause</p>
                                    </div>
                                    <Switch
                                        checked={settings.showFocusPoint}
                                        onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-neutral-900/40 rounded-xl border border-white/5">
                                    <div className="space-y-0.5">
                                        <p className="text-[12px] text-white font-medium">Son</p>
                                        <p className="text-[10px] text-neutral-500">Bip à chaque mot</p>
                                    </div>
                                    <Switch
                                        checked={settings.enableSound}
                                        onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                        className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
