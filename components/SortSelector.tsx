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
                                 // Calculate position: Left of the icon by default
                                 let x = rect.left - 180; 
                                 let y = rect.top - 5; 
                                 
                                 // Boundary check: if too far left, flip to right
                                 if (x < 10) {
                                    x = rect.right + 10;
                                 }

                                 setTooltip({ show: true, x, y });
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
           className="fixed z-[9999] bg-[#050505] border border-gray-700 p-3 shadow-2xl w-44 rounded-sm pointer-events-none animate-fade-in"
           style={{ top: tooltip.y, left: tooltip.x }}
        >
           <p className="text-[10px] text-gray-300 leading-relaxed font-sans">
             Based on views, votes, release date, and social trends.
           </p>
        </div>
      )}
    </div>
  );
};