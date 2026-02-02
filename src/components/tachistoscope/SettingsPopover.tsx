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
                className="w-[380px] p-0 bg-[#0A0A0A]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] text-slate-200 overflow-hidden z-[110]"
                side="top"
                align="end"
                sideOffset={20}
            >
                {/* HEADER : Titre + Navigation Pill */}
                <div className="pt-6 px-6 pb-4 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="flex justify-between items-baseline mb-5">
                        <h2 className="text-lg font-medium tracking-tight text-white">Réglages</h2>
                    </div>

                    {/* NAVIGATION CAPSULE */}
                    <div className="flex p-1 bg-black/40 rounded-full border border-white/5 backdrop-blur-md">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs transition-all duration-300 rounded-full",
                                    activeTab === tab.id
                                        ? "font-bold text-white bg-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                                        : "font-medium text-white/40 hover:text-white"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BODY : Contenu des onglets */}
                <div className="p-6 min-h-[300px] space-y-7">
                    {activeTab === 'visual' && (
                        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* CUSTOM SELECT (POLICE) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Typographie</label>
                                <Select
                                    value={settings.fontFamily}
                                    onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                                >
                                    <SelectTrigger className="w-full bg-white/5 hover:bg-white/10 text-sm text-white py-6 px-4 rounded-xl border border-white/5 outline-none transition-colors cursor-pointer focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Choisir une police" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0A0A0A] border-white/10 text-white backdrop-blur-xl z-[200]">
                                        <SelectItem value="arial" className="focus:bg-white/10 focus:text-white">Arial</SelectItem>
                                        <SelectItem value="verdana" className="focus:bg-white/10 focus:text-white">Verdana</SelectItem>
                                        <SelectItem value="mdi-ecole" className="focus:bg-white/10 focus:text-white">MDI École</SelectItem>
                                        <SelectItem value="opendyslexic" className="focus:bg-white/10 focus:text-white">OpenDyslexic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* NEON SLIDER (ZOOM) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-slate-300">Zoom</label>
                                    <span className="text-xs font-bold text-primary">{settings.fontSize}x</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    min={5}
                                    max={30}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ fontSize: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_12px_rgba(37,99,235,0.4)] [&_.bg-secondary]:bg-white/10 h-1.5"
                                />
                            </div>

                            {/* NEON SLIDER (ESPACEMENT) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-slate-300">Espacement</label>
                                    <span className="text-xs font-bold text-primary">{settings.letterSpacing}px</span>
                                </div>
                                <Slider
                                    value={[settings.letterSpacing]}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_12px_rgba(37,99,235,0.4)] [&_.bg-secondary]:bg-white/10 h-1.5"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'timing' && (
                        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* NEON SLIDER (EXPOSITION) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-slate-300">Exposition</label>
                                    <span className="text-xs font-bold text-primary">{(settings.speedMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.speedMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ speedMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_12px_rgba(37,99,235,0.4)] [&_.bg-secondary]:bg-white/10 h-1.5"
                                />
                            </div>

                            {/* NEON SLIDER (PAUSE) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-medium text-slate-300">Pause Inter-mots</label>
                                    <span className="text-xs font-bold text-primary">{(settings.gapMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.gapMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ gapMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:h-3.5 [&_[role=slider]]:w-3.5 [&_[role=slider]]:shadow-lg [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-primary [&_.bg-primary]:shadow-[0_0_12px_rgba(37,99,235,0.4)] [&_.bg-secondary]:bg-white/10 h-1.5"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'focus' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-2">Mise en avant</label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-200 font-medium">Voyelles</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Coloration rouge</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightVowels}
                                        onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-200 font-medium">Lettres Muettes</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Coloration grise</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightSilent}
                                        onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-200 font-medium">Point de Fixation</p>
                                        <p className="text-[10px] text-white/30 uppercase tracking-wider">Afficher + pendant pause</p>
                                    </div>
                                    <Switch
                                        checked={settings.showFocusPoint}
                                        onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sound' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-2">Feedback audio</label>

                            <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-200 font-medium">Son</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Bip à chaque mot</p>
                                </div>
                                <Switch
                                    checked={settings.enableSound}
                                    onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-white/10"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM GLOW ACCENT */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            </PopoverContent>
        </Popover>
    );
}
