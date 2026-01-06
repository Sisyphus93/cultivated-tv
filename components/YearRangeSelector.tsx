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

  // Keep a ref of the latest range to access in event listeners without re-binding them
  const rangeRef = useRef(localRange);
  useEffect(() => {
    rangeRef.current = localRange;
  }, [localRange]);

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

  // Drag Start (Mouse & Touch)
  const handleDragStart = (type: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    // Prevent default only on touch to stop potential emulated mouse events or scrolling issues initially
    if ('touches' in e) {
        // Optional: e.preventDefault(); 
    }
    setIsDragging(type);
  };

  // Unified Move Logic
  const updatePosition = useCallback((clientX: number) => {
    if (!isDragging || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
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

  // Global Listeners for Move/End
  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updatePosition(e.clientX);
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling while dragging
      updatePosition(e.touches[0].clientX);
    };

    const onEnd = () => {
      setIsDragging(null);
      onChange(rangeRef.current); // Commit change using the ref
    };

    // Add listeners (passive: false is important for touchmove to allow preventDefault)
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, [isDragging, updatePosition, onChange]);

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
        <span className="text-[10px] font-mono uppercase tracking-widest border-b border-transparent group-hover:border-gray-500 transition-colors pb-0.5">
            <span className={`${isOpen ? 'text-gray-400' : 'text-gray-600 group-hover:text-gray-500'} transition-colors`}>Year: </span>
            <span className="text-white font-bold">{localRange[0]}</span>
            <span className="text-gray-600 mx-1">-</span>
            <span className="text-white font-bold">{localRange[1]}</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-4 w-72 bg-[#111] border border-gray-800 shadow-2xl z-50 animate-fade-in p-6 rounded-sm">
          <div className="flex justify-between text-xs text-gray-500 font-mono mb-4">
             <span>{minYear}</span>
             <span className="text-cyan-400 font-bold">{localRange[0]} - {localRange[1]}</span>
             <span>{maxYear}</span>
          </div>

          <div className="relative h-6 flex items-center select-none touch-none" ref={trackRef}>
            {/* Track Background */}
            <div className="absolute left-0 right-0 h-1 bg-gray-800 rounded-full" />
            
            {/* Active Range */}
            <div 
                className="absolute h-1 bg-white"
                style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            />

            {/* Min Thumb */}
            <div
                onMouseDown={handleDragStart('min')}
                onTouchStart={handleDragStart('min')}
                className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                style={{ left: `${minPercent}%`, marginLeft: '-6px' }} 
            />

            {/* Max Thumb */}
            <div
                onMouseDown={handleDragStart('max')}
                onTouchStart={handleDragStart('max')}
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
