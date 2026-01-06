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
  const [showTooltip, setShowTooltip] = useState(false);

  // Use provided options or fallback to default
  const activeOptions = options || SORT_OPTIONS;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowTooltip(false);
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
        <div className="absolute top-full right-0 mt-2 w-48 bg-[#111] border border-gray-800 shadow-2xl z-50 animate-fade-in origin-top-right">
          <div className="py-1">
             {activeOptions.map(option => {
                const isPopularity = option.label === 'Popularity';
                
                return (
                  <div key={option.value} className="relative group/item">
                    <button
                        onClick={() => {
                            onSelect(option.value);
                            setIsOpen(false);
                            setShowTooltip(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${option.value === selectedSort ? 'text-white' : 'text-gray-500'}`}
                    >
                        <span className="flex items-center gap-2">
                           {option.label}
                           {isPopularity && (
                             <div 
                               role="button"
                               className="p-1 -m-1 ml-1 text-gray-500 group-hover:text-black hover:!text-blue-500 transition-colors z-20 cursor-help"
                               onMouseEnter={() => setShowTooltip(true)}
                               onMouseLeave={() => setShowTooltip(false)}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setShowTooltip(!showTooltip);
                               }}
                             >
                               <Info size={11} strokeWidth={2} />
                             </div>
                           )}
                        </span>
                        {option.value === selectedSort && <Check size={12} />}
                    </button>

                    {/* Tooltip */}
                    {isPopularity && showTooltip && (
                      <div className="absolute z-[60] bg-gray-900 border border-gray-700 p-2 shadow-xl w-full right-0 top-full mt-1">
                         <div className="relative">
                           {/* Arrow (Up pointing -> towards item) */}
                           <div className="absolute bottom-full right-4 -mb-px border-4 border-transparent border-b-gray-700" />
                           
                           <p className="text-[10px] text-gray-300 normal-case leading-relaxed font-sans">
                             Based on views, votes, release date, and social trends.
                           </p>
                         </div>
                      </div>
                    )}
                  </div>
                );
             })}
          </div>
        </div>
      )}
    </div>
  );
};