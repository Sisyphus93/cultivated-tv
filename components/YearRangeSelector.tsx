import React, { useState, useRef, useEffect, useCallback } from 'react';

interface YearRangeSelectorProps {
  minYear: number;
  maxYear: number;
  selectedRange: [number, number];
  onChange: (range: [number, number]) => void;
}

export const YearRangeSelector: React.FC<YearRangeSelectorProps> = ({
  minYear,
  maxYear,
  selectedRange,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Local state for smooth dragging before commit
  const [localRange, setLocalRange] = useState<[number, number]>(selectedRange);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  // Sync props to local state when not dragging
  useEffect(() => {
    if (!isDragging) {
      setLocalRange(selectedRange);
    }
  }, [selectedRange, isDragging]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag Logic
  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(type);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const totalYears = maxYear - minYear;
    const yearValue = Math.round(minYear + (percent * totalYears));

    setLocalRange(prev => {
      const [currMin, currMax] = prev;
      if (isDragging === 'min') {
        const newMin = Math.min(yearValue, currMax); // Clamp to max
        return [newMin, currMax];
      } else {
        const newMax = Math.max(yearValue, currMin); // Clamp to min
        return [currMin, newMax];
      }
    });
  }, [isDragging, minYear, maxYear]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(null);
      onChange(localRange); // Commit change
    }
  }, [isDragging, localRange, onChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Calculate percentages for UI
  const getPercent = (value: number) => {
    return ((value - minYear) / (maxYear - minYear)) * 100;
  };

  const minPercent = getPercent(localRange[0]);
  const maxPercent = getPercent(localRange[1]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group cursor-pointer"
      >
        <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
        <span className={`text-[10px] font-mono uppercase tracking-widest border-b border-transparent group-hover:border-gray-500 transition-colors pb-0.5 ${isOpen ? 'text-white font-bold' : 'text-gray-500 group-hover:text-white'}`}>
            Year: <span className="text-white">{localRange[0]}</span> - <span className="text-white">{localRange[1]}</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-72 bg-[#111] border border-gray-800 shadow-2xl z-50 animate-fade-in p-6 rounded-sm">
          <div className="flex justify-between text-xs text-gray-500 font-mono mb-4">
             <span>{minYear}</span>
             <span className="text-cyan-400 font-bold">{localRange[0]} - {localRange[1]}</span>
             <span>{maxYear}</span>
          </div>

          <div className="relative h-6 flex items-center select-none" ref={trackRef}>
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1 bg-gray-800 rounded-full" />
            
            {/* Active Range */}
            <div 
                className="absolute h-1 bg-white"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            />

            {/* Min Thumb */}
            <div
                onMouseDown={handleMouseDown('min')}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                style={{ left: `${minPercent}%`, marginLeft: '-6px' }} 
            />

            {/* Max Thumb */}
            <div
                onMouseDown={handleMouseDown('max')}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                style={{ left: `${maxPercent}%`, marginLeft: '-6px' }} 
            />
          </div>

          <div className="mt-4 text-[10px] text-gray-600 font-mono text-center">
             Drag handles to filter era
          </div>
        </div>
      )}
    </div>
  );
};