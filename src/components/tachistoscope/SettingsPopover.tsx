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
import { Settings2, Type, Zap, Timer, MousePointer2 } from "lucide-react";

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
                className="w-80 p-6 bg-white border border-border/50 shadow-xl rounded-xl z-[110]"
                side="top"
                align="end"
                sideOffset={12}
            >
                <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                        <Settings2 className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-bold text-sm uppercase tracking-wider">Réglages Lecteur</h4>
                    </div>

                    {/* Typography */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                    <Type className="w-3.5 h-3.5" /> Police
                                </Label>
                            </div>
                            <Select
                                value={settings.fontFamily}
                                onValueChange={(v: any) => updateSettings({ fontFamily: v })}
                            >
                                <SelectTrigger className="w-full h-8 text-sm">
                                    <SelectValue placeholder="Choisir une police" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sans">Sans Serif</SelectItem>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="mono">Monospace</SelectItem>
                                    <SelectItem value="opendyslexic">OpenDyslexic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Zoom: {settings.fontSize}</Label>
                            </div>
                            <Slider
                                value={[settings.fontSize]}
                                min={5}
                                max={30}
                                step={1}
                                onValueChange={([v]) => updateSettings({ fontSize: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-tight">Espacement: {settings.letterSpacing}px</Label>
                            </div>
                            <Slider
                                value={[settings.letterSpacing]}
                                min={0}
                                max={40}
                                step={1}
                                onValueChange={([v]) => updateSettings({ letterSpacing: v })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Engine Timing */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                    <Zap className="w-3.5 h-3.5" /> Exposition: {(settings.speedMs / 1000).toFixed(1)} s
                                </Label>
                            </div>
                            <Slider
                                value={[settings.speedMs]}
                                min={100}
                                max={5000}
                                step={100}
                                onValueChange={([v]) => updateSettings({ speedMs: v })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-tight">
                                    <Timer className="w-3.5 h-3.5" /> Temps Inter-mots: {(settings.gapMs / 1000).toFixed(1)} s
                                </Label>
                            </div>
                            <Slider
                                value={[settings.gapMs]}
                                min={100}
                                max={5000}
                                step={100}
                                onValueChange={([v]) => updateSettings({ gapMs: v })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-border/50" />

                    {/* Features */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold">Mise en exergue</Label>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Colorer les voyelles</p>
                        </div>
                        <Switch
                            checked={settings.highlightVowels}
                            onCheckedChange={(v) => updateSettings({ highlightVowels: v })}
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
