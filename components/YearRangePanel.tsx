import React, { useEffect, useRef, useState } from 'react';
import { PanelTitle, Preset } from './ui';

interface YearRangePanelProps {
  minYear: number;
  maxYear: number;
  selectedRange: [number, number];
  onChange: (range: [number, number]) => void;
}

/** Decade presets offered inside the panel. */
const decadePresets = (minYear: number, maxYear: number): { label: string; range: [number, number] }[] => [
  { label: 'All', range: [minYear, maxYear] },
  { label: '1990s', range: [1990, 1999] },
  { label: '2000s', range: [2000, 2009] },
  { label: '2010s', range: [2010, 2019] },
  { label: '2020s', range: [2020, maxYear] },
];

export const YearRangePanel: React.FC<YearRangePanelProps> = ({
  minYear,
  maxYear,
  selectedRange,
  onChange,
}) => {
  const [localRange, setLocalRange] = useState<[number, number]>(selectedRange);
  const rangeRef = useRef<[number, number]>(selectedRange);
  const draggingRef = useRef<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalRange(selectedRange);
    rangeRef.current = selectedRange;
  }, [selectedRange]);

  const commit = (range: [number, number]) => {
    rangeRef.current = range;
    setLocalRange(range);
    onChange(range);
  };

  const percent = (value: number) => ((value - minYear) / (maxYear - minYear)) * 100;

  const valueFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return minYear;
    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return Math.round(minYear + ratio * (maxYear - minYear));
  };

  useEffect(() => {
    const move = (clientX: number) => {
      if (!draggingRef.current) return;
      const [lo, hi] = rangeRef.current;
      const next = valueFromClientX(clientX);

      if (draggingRef.current === 'min') {
        commit([Math.min(next, hi), hi]);
      } else {
        commit([lo, Math.max(next, lo)]);
      }
    };

    const onMouseMove = (event: MouseEvent) => move(event.clientX);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) move(touch.clientX);
    };
    const stop = () => {
      draggingRef.current = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', stop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minYear, maxYear]);

  const minPercent = percent(localRange[0]);
  const maxPercent = percent(localRange[1]);

  return (
    <div className="space-y-5">
      <PanelTitle hint={`${minYear} – ${maxYear}`}>Years</PanelTitle>

      <div className="flex items-baseline gap-2">
        <span className="font-display text-[34px] leading-none tabular-nums text-ink">
          {localRange[0]}
        </span>
        <span className="text-[16px] text-faint">–</span>
        <span className="font-display text-[34px] leading-none tabular-nums text-ink">
          {localRange[1]}
        </span>
      </div>

      <div
        className="relative flex h-6 cursor-pointer select-none items-center touch-none"
        ref={trackRef}
        onMouseDown={(event) => {
          const next = valueFromClientX(event.clientX);
          const [lo, hi] = rangeRef.current;
          const closest = Math.abs(next - lo) <= Math.abs(next - hi) ? 'min' : 'max';
          draggingRef.current = closest;
          if (closest === 'min') commit([Math.min(next, hi), hi]);
          else commit([lo, Math.max(next, lo)]);
        }}
      >
        <div className="absolute left-0 right-0 h-[3px] rounded-full bg-line" />
        <div
          className="absolute h-[3px] rounded-full bg-ink"
          style={{ left: `${minPercent}%`, width: `${Math.max(maxPercent - minPercent, 0)}%` }}
        />
        <button
          type="button"
          aria-label="Earliest year"
          onMouseDown={() => {
            draggingRef.current = 'min';
          }}
          onTouchStart={() => {
            draggingRef.current = 'min';
          }}
          className="absolute h-4 w-4 -translate-x-1/2 cursor-grab rounded-full border border-line-strong bg-surface shadow-[0_2px_6px_rgba(23,22,20,0.18)] transition-transform hover:scale-110 active:cursor-grabbing"
          style={{ left: `${minPercent}%` }}
        />
        <button
          type="button"
          aria-label="Latest year"
          onMouseDown={() => {
            draggingRef.current = 'max';
          }}
          onTouchStart={() => {
            draggingRef.current = 'max';
          }}
          className="absolute h-4 w-4 -translate-x-1/2 cursor-grab rounded-full border border-line-strong bg-surface shadow-[0_2px_6px_rgba(23,22,20,0.18)] transition-transform hover:scale-110 active:cursor-grabbing"
          style={{ left: `${maxPercent}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {decadePresets(minYear, maxYear).map((preset) => {
          const [lo, hi] = preset.range;
          const active = localRange[0] === lo && localRange[1] === hi;
          return (
            <Preset
              key={preset.label}
              active={active}
              onClick={() => commit([Math.max(lo, minYear), Math.min(hi, maxYear)])}
            >
              {preset.label}
            </Preset>
          );
        })}
      </div>

      <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
        Drag the handles to chase a specific era.
      </p>
    </div>
  );
};
