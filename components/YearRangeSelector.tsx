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

  // Local state so dragging feels immediate; we only commit on release.
  const [localRange, setLocalRange] = useState<[number, number]>(selectedRange);
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);

  const rangeRef = useRef(localRange);
  useEffect(() => {
    rangeRef.current = localRange;
  }, [localRange]);

  useEffect(() => {
    if (!isDragging) setLocalRange(selectedRange);
  }, [selectedRange, isDragging]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleDragStart = (type: 'min' | 'max') => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(type);
  };

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!isDragging || !trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      const yearValue = Math.round(minYear + percent * (maxYear - minYear));

      setLocalRange(prev => {
        const [currMin, currMax] = prev;
        if (isDragging === 'min') return [Math.min(yearValue, currMax), currMax];
        return [currMin, Math.max(yearValue, currMin)];
      });
    },
    [isDragging, minYear, maxYear],
  );

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      updatePosition(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    };
    const onEnd = () => {
      setIsDragging(null);
      onChange(rangeRef.current);
    };

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

  const getPercent = (value: number) => ((value - minYear) / (maxYear - minYear)) * 100;
  const minPercent = getPercent(localRange[0]);
  const maxPercent = getPercent(localRange[1]);

  // Keyboard access: the thumbs are real buttons, so the slider works without a mouse.
  const nudge = (type: 'min' | 'max', delta: number) => {
    setLocalRange(prev => {
      const [currMin, currMax] = prev;
      const next =
        type === 'min'
          ? [Math.min(Math.max(currMin + delta, minYear), currMax), currMax]
          : [currMin, Math.max(Math.min(currMax + delta, maxYear), currMin)];
      const tuple: [number, number] = [next[0], next[1]];
      onChange(tuple);
      return tuple;
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="label-caps flex items-baseline gap-1.5 border-b border-ink/20 pb-0.5 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink/60 hover:text-ink"
      >
        <span className="text-ink/62">Years:</span>
        <span className="font-bold text-ink">{localRange[0]}</span>
        <span className="text-ink/62">—</span>
        <span className="font-bold text-ink">{localRange[1]}</span>
      </button>

      {isOpen ? (
        <div className="panel animate-fade-in absolute left-0 top-full z-[100] mt-2 w-72 origin-top-left p-6">
          <div className="label-caps mb-5 flex justify-between text-ink/62">
            <span>{minYear}</span>
            <span className="font-bold text-rustdeep">
              {localRange[0]} — {localRange[1]}
            </span>
            <span>{maxYear}</span>
          </div>

          <div className="relative flex h-6 touch-none select-none items-center" ref={trackRef}>
            <span aria-hidden="true" className="absolute inset-x-0 h-px bg-ink/30" />
            <span
              aria-hidden="true"
              className="absolute h-[3px] bg-rust"
              style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
            />

            <button
              type="button"
              aria-label={`First year, currently ${localRange[0]}`}
              aria-valuenow={localRange[0]}
              onMouseDown={handleDragStart('min')}
              onTouchStart={handleDragStart('min')}
              onKeyDown={e => {
                if (e.key === 'ArrowLeft') nudge('min', -1);
                if (e.key === 'ArrowRight') nudge('min', 1);
                if (e.key === 'PageUp') nudge('min', 10);
                if (e.key === 'PageDown') nudge('min', -10);
              }}
              className="absolute h-4 w-4 cursor-grab touch-none rounded-full border border-ink bg-paper transition-transform duration-[180ms] ease-cabinet hover:scale-110 active:cursor-grabbing"
              style={{ left: `${minPercent}%`, marginLeft: '-8px' }}
            />
            <button
              type="button"
              aria-label={`Last year, currently ${localRange[1]}`}
              aria-valuenow={localRange[1]}
              onMouseDown={handleDragStart('max')}
              onTouchStart={handleDragStart('max')}
              onKeyDown={e => {
                if (e.key === 'ArrowLeft') nudge('max', -1);
                if (e.key === 'ArrowRight') nudge('max', 1);
                if (e.key === 'PageUp') nudge('max', 10);
                if (e.key === 'PageDown') nudge('max', -10);
              }}
              className="absolute h-4 w-4 cursor-grab touch-none rounded-full border border-ink bg-paper transition-transform duration-[180ms] ease-cabinet hover:scale-110 active:cursor-grabbing"
              style={{ left: `${maxPercent}%`, marginLeft: '-8px' }}
            />
          </div>

          <p className="label-caps mt-4 text-center text-ink/62">
            Drag the handles, or use the arrow keys
          </p>
        </div>
      ) : null}
    </div>
  );
};
