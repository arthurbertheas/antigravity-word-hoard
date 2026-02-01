import React from 'react';
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

export function SettingsPopover() {
    const { settings, updateSettings } = usePlayer();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Settings2 className="w-5 h-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-80 p-5 bg-[#171717] border border-white/10 shadow-2xl rounded-2xl z-[110]"
                side="top"
                align="end"
                sideOffset={20}
            >
                <div className="space-y-6">
                    {/* Typography Section */}
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">
                                    Police
                                </Label>
                                <span className="text-white text-[10px] font-mono uppercase opacity-50">
                                    {settings.fontFamily}
                                </span>
                            </div>
                            <Select
                                value={settings.fontFamily}
                                onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                            >
                                <SelectTrigger className="w-full h-8 bg-neutral-800 border-neutral-700 text-white text-xs hover:border-neutral-500 transition-colors">
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Zoom</Label>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Espacement</Label>
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

                    <div className="h-px bg-white/5" />

                    {/* Timing Section */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Exposition</Label>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Pause Inter-mots</Label>
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

                    <div className="h-px bg-white/5" />

                    {/* Feature Toggles */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Voyelles</Label>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Mise en exergue</p>
                        </div>
                        <Switch
                            checked={settings.highlightVowels}
                            onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Point de Fixation</Label>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Afficher + pendant pause</p>
                        </div>
                        <Switch
                            checked={settings.showFocusPoint}
                            onCheckedChange={(v) => updateSettings({ showFocusPoint: v })}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-neutral-400 text-[10px] font-bold uppercase tracking-[0.15em]">Son</Label>
                            <p className="text-[9px] text-neutral-500 uppercase tracking-widest">Bip à chaque mot</p>
                        </div>
                        <Switch
                            checked={settings.enableSound}
                            onCheckedChange={(v) => updateSettings({ enableSound: v })}
                            className="data-[state=checked]:bg-white data-[state=unchecked]:bg-neutral-800 [&_span]:bg-neutral-100 data-[state=checked]:[&_span]:bg-neutral-900"
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
