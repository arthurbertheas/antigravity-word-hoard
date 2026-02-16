import { PanelTopbar } from '@/components/ui/PanelTopbar';
import { Play } from 'lucide-react';

interface DiapoTopbarProps {
  wordCount: number;
  onClose: () => void;
}

export function DiapoTopbar({ wordCount, onClose }: DiapoTopbarProps) {
  return (
    <PanelTopbar
      title="Diaporama"
      icon={
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white">
          <Play className="w-3 h-3 fill-white" />
        </div>
      }
      badge={
        <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-px rounded-full">
          {wordCount} mot{wordCount > 1 ? 's' : ''}
        </span>
      }
      onClose={onClose}
    />
  );
}
