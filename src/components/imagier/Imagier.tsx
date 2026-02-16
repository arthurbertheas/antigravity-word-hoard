import { useState, useMemo, useCallback, useEffect } from 'react';
import { Word } from '@/types/word';
import { ImagierSettings, DEFAULT_IMAGIER_SETTINGS, getGridMax } from '@/types/imagier';
import { filterWordsWithImages } from '@/utils/imagier-utils';
import { ImagierTopbar } from './ImagierTopbar';
import { ImagierPreview } from './ImagierPreview';
import { ImagierPanel } from './ImagierPanel';
import './imagier-print.css';

interface ImagierProps {
  words: Word[];
  isOpen: boolean;
  onClose: () => void;
}

export function Imagier({ words, isOpen, onClose }: ImagierProps) {
  if (!isOpen) return null;
  return <ImagierContent words={words} onClose={onClose} />;
}

function ImagierContent({ words, onClose }: { words: Word[]; onClose: () => void }) {
  const [settings, setSettings] = useState<ImagierSettings>(DEFAULT_IMAGIER_SETTINGS);
  const [currentPage, setCurrentPage] = useState(0);

  const { withImages, removedCount } = useMemo(
    () => filterWordsWithImages(words),
    [words]
  );

  const [orderedWords, setOrderedWords] = useState<Word[]>(withImages);

  // Pagination
  const max = getGridMax(settings.grid);
  const totalPages = Math.max(1, Math.ceil(orderedWords.length / max));

  // Reset page when grid changes
  useEffect(() => {
    setCurrentPage(0);
  }, [settings.grid]);

  // Clamp current page if words are removed
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const updateSetting = useCallback(<K extends keyof ImagierSettings>(
    key: K,
    value: ImagierSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    setOrderedWords(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#ECEDF2] flex flex-col imagier-overlay">
      <ImagierTopbar
        wordCount={orderedWords.length}
        onClose={onClose}
        onPrint={handlePrint}
      />
      <div className="flex-1 flex overflow-hidden">
        <ImagierPreview
          words={orderedWords}
          settings={settings}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onReorder={handleReorder}
        />
        <ImagierPanel
          settings={settings}
          updateSetting={updateSetting}
          words={orderedWords}
          removedCount={removedCount}
          onReorder={handleReorder}
        />
      </div>
    </div>
  );
}
