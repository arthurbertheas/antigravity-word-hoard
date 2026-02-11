import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Word } from '@/types/word';
import { cn } from '@/lib/utils';

interface SaveListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string, tags: string[], words: Word[], saveAsNew?: boolean) => void;
    words: Word[];
    initialData?: {
        name: string;
        description: string;
        tags: string[];
        words?: Word[];
    };
    mode: 'create' | 'edit';
    existingLists: Array<{ id: string; name: string }>;
    currentListId?: string | null;
}

const SUGGESTED_TAGS = ['CP', 'CE1', 'CE2', 'CM1', 'Phonologie', 'Lecture', 'Orthographe'];

export function SaveListModal({
    isOpen,
    onClose,
    onSave,
    words: initialWords,
    initialData,
    mode,
    existingLists,
    currentListId
}: SaveListModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [localWords, setLocalWords] = useState<Word[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setTags(initialData.tags);
            setLocalWords(initialData.words || initialWords);
        } else {
            setName('');
            setDescription('');
            setTags([]);
            setLocalWords(initialWords);
        }
        setTagInput('');
    }, [initialData, initialWords, isOpen]);

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleRemoveWord = (wordToRemove: Word) => {
        setLocalWords(localWords.filter(w => w.MOTS !== wordToRemove.MOTS));
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const isRenamed = mode === 'edit' && initialData && trimmedName.toLowerCase() !== initialData.name.trim().toLowerCase();
        const shouldSaveAsNew = mode === 'create' || isRenamed;

        // Check for duplicate names
        let isDuplicate = false;
        if (shouldSaveAsNew) {
            isDuplicate = existingLists.some(list =>
                list.name.trim().toLowerCase() === trimmedName.toLowerCase()
            );
        }

        if (isDuplicate) {
            setNameError('Une liste avec ce nom existe déjà');
            return;
        }

        setNameError('');
        onSave(trimmedName, description.trim(), tags, localWords, shouldSaveAsNew);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[560px] px-0 py-0 border-none rounded-[22px] overflow-hidden z-[102]">
                <DialogHeader className="p-6 pb-4 flex flex-row items-center justify-between border-b border-[#F3F4F6]">
                    <DialogTitle className="flex items-center gap-2 font-['Sora'] text-[18px] font-[700] text-[#1A1A2E]">
                        {mode === 'create' ? '💾 Sauvegarder la liste' : '✏️ Modifier la liste'}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    {/* Nom */}
                    <div>
                        <label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
                            Nom de la liste <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameError('');
                                }}
                                placeholder="Ex: Sons CH + V pour Léo"
                                maxLength={50}
                                className={cn(
                                    "h-11 rounded-[10px] border-[1.5px] bg-[#F8F9FC] font-['DM_Sans'] text-[14px]",
                                    nameError ? 'border-red-500' : 'border-[#E5E7EB] focus-visible:border-[#6C5CE7]'
                                )}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#B0B5C0]">
                                {name.length}/50
                            </span>
                        </div>
                        {nameError && (
                            <span className="text-[11px] text-red-500 mt-1 block">
                                {nameError}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
                            Description <span className="text-[13px] font-[400] text-[#6B7280] ml-1">(optionnel)</span>
                        </label>
                        <div className="relative">
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Pour travailler les sons complexes..."
                                maxLength={200}
                                className="min-h-[80px] rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] font-['DM_Sans'] text-[14px] resize-none focus-visible:border-[#6C5CE7]"
                            />
                            <span className="absolute right-3 bottom-3 text-[11px] text-[#B0B5C0]">
                                {description.length}/200
                            </span>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
                            Étiquettes <span className="text-[13px] font-[400] text-[#6B7280] ml-1">(optionnel)</span>
                        </label>
                        <div className="flex flex-wrap gap-2 p-2 border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] rounded-[10px] min-h-[44px] transition-all focus-within:border-[#6C5CE7]">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-[9px] py-[2px] bg-[#F0EDFF] text-[#7C6FD4] text-[11px] font-[500] font-['DM_Sans'] rounded-[8px]"
                                >
                                    {tag}
                                    <button
                                        onClick={() => handleRemoveTag(tag)}
                                        className="hover:opacity-70"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag(tagInput);
                                    }
                                }}
                                placeholder={tags.length === 0 ? "Ajouter une étiquette..." : ""}
                                className="flex-1 min-w-[120px] bg-transparent text-[13px] outline-none"
                                disabled={tags.length >= 8}
                            />
                            <div className="hidden">
                                {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleAddTag(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* Suggestions */}
                        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap">Suggestions :</span>
                            {SUGGESTED_TAGS.filter(t => !tags.includes(t)).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleAddTag(tag)}
                                    className="px-2.5 py-1 rounded-full border border-[#E5E7EB] bg-white text-[11px] text-[#6B7280] hover:border-[#C4B8FF] hover:text-[#6C5CE7] transition-colors whitespace-nowrap"
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mots */}
                    <div>
                        <label className="text-[14px] font-[700] text-[#1A1A2E] font-['DM_Sans'] mb-2.5 block tracking-tight">
                            Aperçu <span className="text-[13px] font-[400] text-[#6B7280] ml-1">({localWords.length} mots)</span>
                        </label>
                        <div className="p-3 border-[1.5px] border-[#E5E7EB] bg-[#F8F9FC] rounded-[10px] max-h-[160px] overflow-y-auto flex flex-wrap gap-2">
                            {localWords.map((word, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1.5 px-[9px] py-[3px] bg-white border border-[#E5E7EB] rounded-[8px] text-[13px] font-[500] font-['DM_Sans'] group"
                                >
                                    {word.MOTS}
                                    <button
                                        onClick={() => handleRemoveWord(word)}
                                        className="text-[#9CA3AF] hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t border-[#F3F4F6] flex sm:justify-between items-center sm:flex-row gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 h-11 border-[1.5px] border-[#E5E7EB] text-[#6B7280] font-[600] font-['DM_Sans'] hover:bg-[#F8F9FC] hover:text-[#1A1A2E]"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="flex-1 h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-[600] font-['DM_Sans'] shadow-[0_4px_12px_rgba(108,92,231,0.2)]"
                    >
                        {mode === 'edit' && name.trim().toLowerCase() === initialData?.name.trim().toLowerCase()
                            ? 'Mettre à jour'
                            : 'Sauvegarder'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
