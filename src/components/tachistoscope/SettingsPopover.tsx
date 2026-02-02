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
        <Popover modal={false}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[360px] p-0 bg-white/95 backdrop-blur-xl border border-slate-100/50 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] text-slate-800 overflow-hidden z-[110]"
                side="top"
                align="end"
                sideOffset={20}
            >
                {/* HEADER : Titre + Navigation Pill */}
                <div className="pt-6 px-6 pb-4">
                    <div className="flex justify-between items-baseline mb-5">
                        <h2 className="text-lg font-bold tracking-tight text-slate-900">Réglages</h2>
                    </div>

                    {/* NAVIGATION CAPSULE */}
                    <div className="flex p-1 bg-slate-100/80 rounded-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex-1 py-1.5 text-xs transition-all duration-300 rounded-full",
                                    activeTab === tab.id
                                        ? "font-bold text-slate-900 bg-white shadow-sm border border-slate-200/50"
                                        : "font-medium text-slate-500 hover:text-slate-800"
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BODY : Contenu des onglets */}
                <div className="p-6 space-y-7">
                    {activeTab === 'visual' && (
                        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* CUSTOM SELECT (POLICE) */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Typographie</label>
                                <Select
                                    value={settings.fontFamily}
                                    onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                                >
                                    <SelectTrigger className="w-full bg-slate-50 hover:bg-slate-100 text-sm font-medium text-slate-700 h-12 px-4 rounded-xl border border-slate-200 outline-none transition-colors cursor-pointer focus:border-blue-500 focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Choisir une police" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-100 text-slate-700 shadow-xl z-[200]">
                                        <SelectItem value="arial" className="focus:bg-slate-100 focus:text-slate-900">Arial</SelectItem>
                                        <SelectItem value="verdana" className="focus:bg-slate-100 focus:text-slate-900">Verdana</SelectItem>
                                        <SelectItem value="mdi-ecole" className="focus:bg-slate-100 focus:text-slate-900">MDI École</SelectItem>
                                        <SelectItem value="opendyslexic" className="focus:bg-slate-100 focus:text-slate-900">OpenDyslexic</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* SLIDER (ZOOM) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-semibold text-slate-600">Zoom</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{settings.fontSize}x</span>
                                </div>
                                <Slider
                                    value={[settings.fontSize]}
                                    min={5}
                                    max={30}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ fontSize: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-100 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-blue-600 [&_.bg-secondary]:bg-slate-200 h-1.5"
                                />
                            </div>

                            {/* SLIDER (ESPACEMENT) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-semibold text-slate-600">Espacement</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{settings.letterSpacing}px</span>
                                </div>
                                <Slider
                                    value={[settings.letterSpacing]}
                                    min={0}
                                    max={50}
                                    step={1}
                                    onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-100 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-blue-600 [&_.bg-secondary]:bg-slate-200 h-1.5"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'timing' && (
                        <div className="space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {/* SLIDER (EXPOSITION) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-semibold text-slate-600">Exposition</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{(settings.speedMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.speedMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ speedMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-100 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-blue-600 [&_.bg-secondary]:bg-slate-200 h-1.5"
                                />
                            </div>

                            {/* SLIDER (PAUSE) */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-sm font-semibold text-slate-600">Pause Inter-mots</label>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{(settings.gapMs / 1000).toFixed(1)}s</span>
                                </div>
                                <Slider
                                    value={[settings.gapMs]}
                                    min={100}
                                    max={5000}
                                    step={100}
                                    onValueChange={([v]) => updateSettings({ gapMs: v })}
                                    className="[&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-slate-100 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:shadow-md [&_[role=slider]]:transition-transform hover:[&_[role=slider]]:scale-110 [&_.bg-primary]:bg-blue-600 [&_.bg-secondary]:bg-slate-200 h-1.5"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'focus' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Mise en avant</label>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-700 font-semibold">Voyelles</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Coloration rouge</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightVowels}
                                        onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-700 font-semibold">Lettres Muettes</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Coloration grise</p>
                                    </div>
                                    <Switch
                                        checked={settings.highlightSilent}
                                        onCheckedChange={(v) => updateSettings({ highlightSilent: v })}
                                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                                    />
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-700 font-semibold">Point de Fixation</p>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Afficher + pendant pause</p>
                                    </div>
                                    <Switch
                                        checked={settings.showFocusPoint}
                                        onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                                        className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'sound' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Feedback audio</label>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-colors">
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-700 font-semibold">Son</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Bip à chaque mot</p>
                                </div>
                                <Switch
                                    checked={settings.enableSound}
                                    onCheckedChange={(v) => updateSettings({ enableSound: v })}
                                    className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-slate-200"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM GLOW ACCENT */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
            </PopoverContent>
        </Popover>
    );
}
