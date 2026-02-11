import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  onForward?: () => void;
  action?: React.ReactNode;
  hideBorder?: boolean;
}

export function PanelHeader({
  title,
  subtitle,
  icon,
  onBack,
  onForward,
  action,
  hideBorder = false
}: PanelHeaderProps) {
  return (
    <div className={cn("items-center justify-between p-[20px_20px_16px] bg-white px-[16px] py-[16px] flex flex-row pr-px",

    !hideBorder && "border-b border-[#F3F4F6]"
    )}>
      <div className="flex items-center gap-3">
        {/* Back or Forward button */}
        {(onBack || onForward) &&
        <button
          onClick={onBack || onForward}
          className="w-9 h-9 rounded-[10px] border-[1.5px] border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B7280] transition-all hover:border-[#C4B8FF] hover:bg-[#F8F6FF] hover:text-[#6C5CE7] flex-shrink-0">

            {onBack ?
          <ChevronLeft className="w-4 h-4" strokeWidth={1.8} /> :

          <ChevronRight className="w-4 h-4" strokeWidth={1.8} />
          }
          </button>
        }

        {/* Icon */}
        {icon &&
        <span className="text-lg flex-shrink-0 flex items-center justify-center">
            {icon}
          </span>
        }

        {/* Title + Subtitle */}
        <div className="flex flex-col">
          <h2 className="font-sora text-[16px] font-[700] text-[#1A1A2E] leading-[1.3] whitespace-nowrap">
            {title}
          </h2>
          {subtitle &&
          <p className="font-['DM_Sans'] text-[12px] text-[#9CA3AF] mt-[2px] leading-tight">
              {subtitle}
            </p>
          }
        </div>
      </div>

      {/* Optional action (e.g., Close button, Toggle) */}
      {action &&
      <div className="flex items-center ml-auto">
          {action}
        </div>
      }
    </div>);

}