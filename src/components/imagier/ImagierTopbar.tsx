import { ChevronLeft, Printer } from 'lucide-react';
import { Orientation } from '@/types/imagier';

interface ImagierTopbarProps {
  wordCount: number;
  orientation: Orientation;
  onClose: () => void;
  onPrint: () => void;
}

export function ImagierTopbar({ wordCount, orientation, onClose, onPrint }: ImagierTopbarProps) {
  return (
    <div className="flex items-center justify-between px-5 bg-white border-b border-[#E5E7EB] h-14 flex-shrink-0 print:hidden">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 border-[1.5px] border-[#E5E7EB] rounded-lg bg-white text-[13px] font-medium font-['DM_Sans'] text-[#6B7280] hover:border-[#6C5CE7] hover:text-[#6C5CE7] transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Retour
        </button>
      </div>

      {/* Center */}
      <div className="flex items-center gap-2.5">
        <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span className="font-sora text-sm font-bold text-[#1A1A2E]">Imagier phonétique</span>
        <span className="text-[11px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2.5 py-0.5 rounded-full">
          {wordCount} image{wordCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className="inline-flex items-center gap-1.5 px-4 py-[7px] rounded-lg text-[13px] font-semibold font-['DM_Sans'] bg-[#6C5CE7] text-white shadow-[0_2px_8px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] hover:-translate-y-px transition-all"
        >
          <Printer className="w-3.5 h-3.5" />
          Imprimer
        </button>
      </div>
    </div>
  );
}
