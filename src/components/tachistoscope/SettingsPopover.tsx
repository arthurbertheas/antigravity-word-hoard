import React, { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover";
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
import { Settings2 } from "lucide-react";
import { cn } from '@/lib/utils';

type TabType = 'visual' | 'timing' | 'focus' | 'sound';

export function SettingsPopover() {
    const { settings, updateSettings } = usePlayer();
    const [activeTab, setActiveTab] = useState<TabType>('visual');

    const tabs: { id: TabType; label: string }[] = [
        { id: 'visual', label: 'Visuel' },
        { id: 'timing', label: 'Timing' },
        { id: 'focus', label: 'Focus' },
        { id: 'sound', label: 'Son' },
    ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[400px] p-0 bg-neutral-900 border-neutral-800 shadow-2xl rounded-2xl z-[110] overflow-hidden"
                side="top"
                align="end"
                sideOffset={20}
            >
                {/* HEADER */}
                <div className="px-6 py-5 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-white">Réglages</h2>
                </div>

                {/* SEGMENTED CONTROL (NAVIGATION) */}
                <div className="px-6 pt-5 pb-2">
                    <div className="grid grid-cols-4 bg-neutral-800 p-1 rounded-lg">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "py-2 text-sm font-medium transition-all duration-200 rounded-md",
                                    activeTab === tab.id
                                        ? "text-neutral-900 bg-white shadow-sm font-bold"
                                        : "text-neutral-400 hover:text-white"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="p-6 min-h-[320px]">
                    {activeTab === 'visual' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* TYPOGRAPHY */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Typographie</label>
                                <Select
                                    value={settings.fontFamily}
                                    onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                                >
                                    <SelectTrigger className="w-full h-12 bg-neutral-800 border-neutral-700 text-white text-base px-4 rounded-xl focus:border-emerald-500 outline-none transition-colors">
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

                            {/* ZOOM */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-medium text-neutral-200">Zoom</label>
                                    <span className="text-base font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">{settings.fontSize}x</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    min={5}
                                    max={30}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ fontSize: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-neutral-700 h-2"
                                />
                            </div>

                            {/* ESPACEMENT */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-medium text-neutral-200">Espacement</label>
                                    <span className="text-base font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">{settings.letterSpacing}px</span>
                                </div>
                                <Slider
                                    value={[settings.letterSpacing]}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-neutral-700 h-2"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'timing' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* EXPOSITION */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-medium text-neutral-200">Exposition</label>
                                    <span className="text-base font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">{(settings.speedMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.speedMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ speedMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-neutral-700 h-2"
                                />
                            </div>

                            {/* PAUSE */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-base font-medium text-neutral-200">Pause Inter-mots</label>
                                    <span className="text-base font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">{(settings.gapMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.gapMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ gapMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-none [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_.bg-primary]:bg-white [&_.bg-secondary]:bg-neutral-700 h-2"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'focus' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider block mb-2">Mise en avant</label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                                    <div className="space-y-1">
                                        <p className="text-base text-neutral-200 font-medium">Voyelles</p>
                                        <p className="text-sm text-neutral-500">Coloration rouge</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightVowels}
                                        onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                                    <div className="space-y-1">
                                        <p className="text-base text-neutral-200 font-medium">Lettres Muettes</p>
                                        <p className="text-sm text-neutral-500">Coloration grise</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightSilent}
                                        onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                                    <div className="space-y-1">
                                        <p className="text-base text-neutral-200 font-medium">Point de Fixation</p>
                                        <p className="text-sm text-neutral-500">Afficher + pendant pause</p>
                                    </div>
                                    <Switch
                                        checked={settings.showFocusPoint}
                                        onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                        className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sound' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider block mb-2">Feedback audio</label>

                            <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-xl border border-neutral-800">
                                <div className="space-y-1">
                                    <p className="text-base text-neutral-200 font-medium">Son</p>
                                    <p className="text-sm text-neutral-500">Bip à chaque mot</p>
                                </div>
                                <Switch
                                    checked={settings.enableSound}
                                    onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-neutral-700"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
