import { X, Printer } from 'lucide-react';

interface ImagierTopbarProps {
  wordCount: number;
  onClose: () => void;
  onPrint: () => void;
}

export function ImagierTopbar({ wordCount, onClose, onPrint }: ImagierTopbarProps) {
  return (
    <div className="flex items-center justify-between px-4 bg-white border-b border-[#E5E7EB] h-11 flex-shrink-0 print:hidden">
      {/* Left — close X */}
      <button
        onClick={onClose}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:text-[#6C5CE7] hover:bg-[#F5F3FF] transition-all"
        title="Fermer (Échap)"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Center — title (absolutely positioned for true centering) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        </div>
        <span className="font-sora text-[13px] font-bold text-[#1A1A2E]">Imagier phonétique</span>
        <span className="text-[10px] font-semibold text-[#6C5CE7] bg-[#F5F3FF] px-2 py-px rounded-full">
          {wordCount} image{wordCount > 1 ? 's' : ''}
        </span>
      </div>

      {/* Right — print */}
      <button
        onClick={onPrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold font-['DM_Sans'] bg-[#6C5CE7] text-white shadow-[0_2px_8px_rgba(108,92,231,0.3)] hover:bg-[#5A4BD1] hover:-translate-y-px transition-all"
      >
        <Printer className="w-3 h-3" />
        Imprimer
      </button>
    </div>
  );
}
