import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Word } from '@/types/word';

interface SaveListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description: string, tags: string[]) => void;
    words: Word[];
    initialData?: {
        name: string;
        description: string;
        tags: string[];
    };
    mode: 'create' | 'edit';
    existingLists: Array<{ id: string; name: string }>;
    currentListId?: string | null;
}

const SUGGESTED_TAGS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', 'Phonologie', 'Lecture', 'Orthographe'];

export function SaveListModal({
    isOpen,
    onClose,
    onSave,
    words,
    initialData,
    mode,
    existingLists,
    currentListId
}: SaveListModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setDescription(initialData.description);
            setTags(initialData.tags);
        } else {
            setName('');
            setDescription('');
            setTags([]);
        }
        setTagInput('');
    }, [initialData, isOpen]);

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = () => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        // Check for duplicate names (excluding current list in edit mode)
        const isDuplicate = existingLists.some(list =>
            list.name.toLowerCase() === trimmedName.toLowerCase() &&
            list.id !== currentListId
        );

        if (isDuplicate) {
            setNameError('Une liste avec ce nom existe déjà');
            return;
        }

        setNameError('');
        onSave(trimmedName, description.trim(), tags);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] z-[102] dialog-overlay-boost">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === 'create' ? '💾 Sauvegarder la liste' : '✏️ Modifier la liste'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Nom */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Nom de la liste *
                        </label>
                        <Input
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError('');
                            }}
                            placeholder="Ex: Sons CH + V pour Léo"
                            maxLength={50}
                            className={nameError ? 'border-red-500' : 'hover:border-primary focus-visible:border-primary'}
                        />
                        {nameError && (
                            <span className="text-xs text-red-500 mt-1 block">
                                {nameError}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground mt-1 block text-right">
                            {name.length}/50
                        </span>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Description (optionnel)
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Pour travailler avec Léo les sons complexes..."
                            rows={3}
                            maxLength={200}
                            className="hover:border-primary focus-visible:border-primary"
                        />
                        <span className="text-xs text-muted-foreground mt-1 block text-right">
                            {description.length}/200
                        </span>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Étiquettes (optionnel)
                        </label>
                        <div className="flex flex-wrap gap-2 p-2 border border-border rounded-lg min-h-[42px] hover:border-primary transition-colors focus-within:border-primary">
                            {tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-md"
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
                                className="flex-1 min-w-[120px] px-2 py-1 text-sm outline-none"
                                disabled={tags.length >= 5}
                            />
                        </div>

                        {/* Suggestions */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs text-muted-foreground font-semibold">Suggestions :</span>
                            {SUGGESTED_TAGS.filter(tag => !tags.includes(tag)).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => handleAddTag(tag)}
                                    className="px-2 py-1 bg-muted text-muted-foreground text-xs font-semibold rounded-md hover:bg-primary/10 hover:text-primary transition-colors"
                                    disabled={tags.length >= 5}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Aperçu */}
                    <div>
                        <label className="text-sm font-semibold text-foreground mb-2 block">
                            Aperçu ({words.length} mots)
                        </label>
                        <div className="p-3 bg-muted/30 rounded-lg max-h-[120px] overflow-y-auto flex flex-wrap gap-2">
                            {words.slice(0, 20).map((word, i) => (
                                <span
                                    key={i}
                                    className="px-2.5 py-1 bg-white border border-border rounded-md text-sm font-medium"
                                >
                                    {word.ORTHO}
                                </span>
                            ))}
                            {words.length > 20 && (
                                <span className="px-2.5 py-1 text-sm text-muted-foreground italic">
                                    +{words.length - 20} autres...
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="hover:border-primary hover:text-primary hover:bg-primary/5">
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={!name.trim()}>
                        {mode === 'create' ? 'Sauvegarder' : 'Mettre à jour'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
