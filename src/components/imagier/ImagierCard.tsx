import { Word } from '@/types/word';
import { ImagierSettings } from '@/types/imagier';
import { applyCasse, formatPhonemes, getDeterminer } from '@/utils/imagier-utils';

interface ImagierCardProps {
  word: Word;
  settings: ImagierSettings;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  isDragOver: boolean;
}

export function ImagierCard({
  word, settings, index,
  onDragStart, onDragOver, onDrop,
  isDragging, isDragOver,
}: ImagierCardProps) {
  const imageUrl = word["image associée"]?.trim();

  return (
    <div
      className={`
        group flex flex-col items-center justify-between bg-white relative cursor-grab select-none
        h-full w-full min-h-0 overflow-hidden transition-all duration-200 p-1.5
        ${settings.cuttingGuides
          ? 'rounded-none border border-dashed border-[#CBD5E1]'
          : 'rounded-lg border-[1.5px] border-[#E5E7EB] hover:border-[#A29BFE] hover:shadow-[0_2px_12px_rgba(108,92,231,0.1)]'
        }
        ${isDragging ? 'opacity-40 scale-95' : ''}
        ${isDragOver ? '!border-[#6C5CE7] !border-dashed bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(108,92,231,0.12)]' : ''}
      `}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={() => onDrop(index)}
    >
      {/* Drag handle */}
      <div className="absolute top-1 right-1 w-4 h-4 rounded flex items-center justify-center opacity-0 group-hover:opacity-60 transition-opacity text-[#9CA3AF] text-[8px] print:hidden">
        ⁞⁞
      </div>

      {/* Image — flex-1 with min-0 so it shrinks to leave room for text */}
      {imageUrl && (
        <div className="flex-1 min-h-0 w-full flex items-center justify-center rounded-md overflow-hidden mb-1">
          <img
            src={imageUrl}
            alt={word.MOTS}
            className="max-w-full max-h-full object-contain"
            onError={(e) => console.warn('[ImagierCard] Image failed to load:', imageUrl)}
          />
        </div>
      )}

      {/* Text zone — flex-shrink-0 so it's always visible */}
      <div className="flex flex-col items-center flex-shrink-0 w-full">
        {/* Determiner */}
        {settings.showDeterminer && getDeterminer(word) && (
          <div className="imagier-det text-[#9CA3AF] font-medium leading-none">
            {getDeterminer(word)}
          </div>
        )}

        {/* Word */}
        {settings.showWord && (
          <div className={`font-sora font-bold text-[#1A1A2E] text-center leading-tight imagier-word imagier-font-${settings.fontSize}`}>
            {applyCasse(word.MOTS, settings.casse)}
          </div>
        )}

        {/* Syllable break */}
        {settings.showSyllBreak && word["segmentation syllabique"] && (
          <div className="imagier-syll text-[#6B7280] font-medium tracking-wide leading-none mt-px">
            {applyCasse(word["segmentation syllabique"], settings.casse)}
          </div>
        )}

        {/* Phoneme */}
        {settings.showPhoneme && word.PHONEMES && (
          <div className="imagier-phon italic text-[#6C5CE7] opacity-80 leading-none mt-px">
            {formatPhonemes(word.PHONEMES)}
          </div>
        )}

        {/* Badges */}
        {(settings.showCategory || settings.showSyllCount) && (
          <div className="flex gap-1 mt-0.5 imagier-badges">
            {settings.showCategory && (
              <span className="text-[7px] font-bold text-[#9CA3AF] bg-[#FAFBFC] px-1 py-px rounded uppercase tracking-wide">
                {word.SYNT}
              </span>
            )}
            {settings.showSyllCount && (
              <span className="text-[7px] font-bold text-[#9CA3AF] bg-[#FAFBFC] px-1 py-px rounded">
                {word.NBSYLL} syll.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
