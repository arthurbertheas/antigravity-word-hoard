import { PanelTopbar } from '@/components/ui/PanelTopbar';

interface ImagierTopbarProps {
  wordCount: number;
  onClose: () => void;
}

export function ImagierTopbar({ wordCount, onClose }: ImagierTopbarProps) {
  return (
    <PanelTopbar
      title="Imagier phonétique"
      icon={
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
      }
      badge={
        <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-px rounded-full">
          {wordCount} image{wordCount > 1 ? 's' : ''}
        </span>
      }
      onClose={onClose}
    />
  );
}
