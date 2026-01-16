import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, Info } from 'lucide-react';
import { SORT_OPTIONS } from '../constants';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectorProps {
  selectedSort: string;
  onSelect: (sortValue: string) => void;
  options?: SortOption[];
}

export const SortSelector: React.FC<SortSelectorProps> = ({ selectedSort, onSelect, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tooltip State for "Fixed" positioning to escape overflow clipping
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  });

  // Use provided options or fallback to default
  const activeOptions = options || SORT_OPTIONS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTooltip(prev => ({ ...prev, show: false }));
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = activeOptions.find(opt => opt.value === selectedSort)?.label || 'Sort';

  // Highlight if it's NOT the default (Newest) to indicate custom sorting
  const isDefault = selectedSort === 'first_air_date.desc' || selectedSort === 'addedAt.desc';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className={!isDefault ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'} />
            <span className="text-[10px] font-mono uppercase tracking-widest border-b border-transparent group-hover:border-gray-500 pb-0.5">
                <span className="text-gray-500 group-hover:text-gray-400 transition-colors">Sort: </span>
                <span className="text-white font-bold">{selectedLabel}</span>
            </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-gray-800 shadow-2xl z-[100] animate-fade-in origin-top-right">
          <div className="py-1 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
             {activeOptions.map(option => {
                const isPopularity = option.label === 'Popularity';
                
                return (
                  <div key={option.value} className="relative group/item">
                    <button
                        onClick={() => {
                            onSelect(option.value);
                            setIsOpen(false);
                            setTooltip(prev => ({ ...prev, show: false }));
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${option.value === selectedSort ? 'text-white' : 'text-gray-500'}`}
                    >
                        <span className="flex items-center gap-2">
                           {option.label}
                           {isPopularity && (
                             <div 
                               role="button"
                               className="p-1 -m-1 ml-1 text-gray-500 group-hover:text-black hover:!text-blue-500 transition-colors z-20 cursor-help"
                               onMouseEnter={(e) => {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 // Position 12px to the left of the icon, vertically centered
                                 setTooltip({ 
                                     show: true, 
                                     x: rect.left - 12, 
                                     y: rect.top + (rect.height / 2) 
                                 });
                               }}
                               onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                               onClick={(e) => {
                                 e.stopPropagation();
                               }}
                             >
                               <Info size={11} strokeWidth={2} />
                             </div>
                           )}
                        </span>
                        {option.value === selectedSort && <Check size={12} />}
                    </button>
                  </div>
                );
             })}
          </div>
        </div>
      )}

      {/* Fixed Tooltip Layer - Escapes Overflow Clipping */}
      {tooltip.show && (
        <div 
           className="fixed z-[9999] bg-black border border-gray-800 px-3 py-2 shadow-2xl rounded-sm pointer-events-none animate-fade-in whitespace-nowrap normal-case tracking-normal text-left"
           style={{ 
               top: tooltip.y, 
               left: tooltip.x,
               transform: 'translate(-100%, -50%)'
           }}
        >
           <span className="text-[10px] text-gray-300 font-sans">
             Based on views, votes, release date, and social trends.
           </span>
           {/* Arrow pointing to the right (towards the icon) */}
           <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-2.5 h-2.5 bg-black border-t border-r border-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};