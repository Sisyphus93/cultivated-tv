import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { SORT_OPTIONS } from '../constants';

interface SortOption {
  value: string;
  label: string;
}

interface SortSelectorProps {
  selectedSort: string;
  onSelect: (sortValue: string) => void;
  options?: SortOption[];
  /** Control label, set like a department name. */
  label?: string;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  selectedSort,
  onSelect,
  options,
  label = 'Order',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number }>({
    show: false,
    x: 0,
    y: 0,
  });

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const selectedLabel = activeOptions.find(opt => opt.value === selectedSort)?.label || 'Order';

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="label-caps flex items-baseline gap-1.5 border-b border-ink/20 pb-0.5 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink/60 hover:text-ink"
      >
        <span className="text-ink/62">{label}:</span>
        <span className="font-bold text-ink">{selectedLabel}</span>
        <ChevronDown size={11} className="mb-px self-center" />
      </button>

      {isOpen ? (
        <div className="panel animate-fade-in absolute left-0 top-full z-[100] mt-2 w-56 origin-top-left py-1" role="listbox">
          {activeOptions.map(option => {
            const isSelected = option.value === selectedSort;
            const isPopularity = option.label === 'Popularity';

            return (
              <div key={option.value} className="relative">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(option.value);
                    setIsOpen(false);
                    setTooltip(prev => ({ ...prev, show: false }));
                  }}
                  className={`label-caps flex w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors duration-[180ms] ease-cabinet hover:bg-ink hover:text-paper ${
                    isSelected ? 'font-bold text-ink' : 'text-ink/72'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {option.label}
                    {isPopularity ? (
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="How popularity is measured"
                        className="z-20 -m-1 ml-1 cursor-help p-1 text-ink/62 hover:text-rustdeep"
                        onMouseEnter={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ show: true, x: rect.left - 12, y: rect.top + rect.height / 2 });
                        }}
                        onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                        onFocus={e => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ show: true, x: rect.left - 12, y: rect.top + rect.height / 2 });
                        }}
                        onBlur={() => setTooltip(prev => ({ ...prev, show: false }))}
                        onClick={e => e.stopPropagation()}
                      >
                        §
                      </span>
                    ) : null}
                  </span>
                  {isSelected ? <Check size={12} /> : null}
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      {tooltip.show ? (
        <div
          className="pointer-events-none fixed z-[9999] animate-fade-in max-w-[240px] whitespace-normal border border-ink/25 bg-paper px-3 py-2 text-left shadow-[3px_4px_0_rgba(26,22,18,0.08)]"
          style={{ top: tooltip.y, left: tooltip.x, transform: 'translate(-100%, -50%)' }}
          role="tooltip"
        >
          <span className="text-[11px] leading-relaxed text-ink/72">
            Weighted from views, votes, release date and social chatter. The loudest
            signal TMDb has — and not the same thing as good.
          </span>
        </div>
      ) : null}
    </div>
  );
};
