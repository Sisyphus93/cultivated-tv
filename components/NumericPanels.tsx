import React from 'react';
import { PanelTitle, Preset } from './ui';

interface NumericPanelProps {
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step: number;
  presets: number[];
  format?: (value: number) => string;
}

interface RangePanelProps extends NumericPanelProps {
  title: string;
  unitLabel: string;
  hint: string;
  footnote: string;
}

const RangePanel: React.FC<RangePanelProps> = ({
  title,
  unitLabel,
  hint,
  footnote,
  value,
  onChange,
  min,
  max,
  step,
  presets,
  format = (n) => String(n),
}) => {
  const parsed = value === '' ? 0 : Number(value);
  const safe = Number.isNaN(parsed) ? 0 : parsed;
  const clamped = Math.min(Math.max(safe, min), max);

  return (
    <div className="space-y-5">
      <PanelTitle hint={hint}>{title}</PanelTitle>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-[34px] leading-none tabular-nums text-ink">
            {format(safe)}
          </span>
          <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted">{unitLabel}</span>
        </div>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-[86px] rounded-lg border border-line bg-paper px-3 text-center text-[13px] tabular-nums text-ink transition-colors focus:border-line-strong focus:outline-none"
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
        aria-label={title}
      />

      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Preset key={preset} active={safe === preset} onClick={() => onChange(String(preset))}>
            {format(preset)}
          </Preset>
        ))}
      </div>

      <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">{footnote}</p>
    </div>
  );
};

export const RatingPanel: React.FC<NumericPanelProps> = (props) => (
  <RangePanel
    {...props}
    title="Rating"
    unitLabel="or higher"
    hint="0 – 10"
    format={(n) => n.toFixed(1)}
    footnote="Only series rated at or above this score on TMDb come through."
  />
);

export const VotesPanel: React.FC<NumericPanelProps> = (props) => (
  <RangePanel
    {...props}
    title="Votes"
    unitLabel="votes or more"
    hint="0 – 5k"
    format={(n) => n.toLocaleString()}
    footnote="More votes means a more reliable score. 100 is a good floor."
  />
);
