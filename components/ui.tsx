import React from 'react';
import type { LucideIcon } from 'lucide-react';

/** Small uppercase label used to introduce sections. */
export const Eyebrow: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = '',
  children,
}) => (
  <p className={`text-[10.5px] uppercase tracking-[0.32em] text-muted ${className}`}>{children}</p>
);

interface ChipProps {
  active?: boolean;
  excluded?: boolean;
  onClick?: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Pill used for genre chips and other filter toggles. */
export const Chip: React.FC<ChipProps> = ({ active, excluded, onClick, title, children }) => {
  const base =
    'inline-flex h-8 shrink-0 items-center gap-2 rounded-full border px-3.5 text-[11px] uppercase tracking-[0.12em] transition-colors duration-200 lg:h-[33px] lg:px-4 lg:text-[10.5px] lg:tracking-[0.11em]';
  const state = active
    ? 'border-ink bg-ink text-white'
    : excluded
    ? 'border-negative/40 bg-negative/[0.04] text-negative line-through decoration-negative/50 hover:border-negative'
    : 'border-line bg-transparent text-ink-soft hover:border-line-strong hover:text-ink';

  return (
    <button type="button" title={title} onClick={onClick} className={`${base} ${state}`}>
      {children}
    </button>
  );
};

interface CircleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  iconSize?: number;
  label: string;
}

/** Circular icon button — carousel controls, rail scroll affordances. */
export const CircleButton = React.forwardRef<HTMLButtonElement, CircleButtonProps>(
  ({ icon: Icon, iconSize = 15, label, className = '', ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-all duration-200 hover:border-ink hover:bg-ink hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-surface disabled:hover:text-ink-soft ${className}`}
      {...rest}
    >
      <Icon size={iconSize} />
    </button>
  )
);
CircleButton.displayName = 'CircleButton';

/** Compact label / value pair used in toolbars (watchlist stats). */
export const StatPair: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="hidden items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted md:flex">
    {label}
    <span className="text-[13px] font-semibold tracking-normal tabular-nums text-ink">{value}</span>
  </span>
);

export const PanelTitle: React.FC<{ children: React.ReactNode; hint?: string }> = ({
  children,
  hint,
}) => (
  <div className="flex items-baseline justify-between gap-3">
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink">{children}</h3>
    {hint && <span className="text-[10px] uppercase tracking-[0.14em] text-faint">{hint}</span>}
  </div>
);

export const Preset: React.FC<{ active?: boolean; onClick: () => void; children: React.ReactNode }> = ({
  active,
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-full border px-3 py-1.5 text-[11px] font-medium tabular-nums transition-colors duration-200 ${
      active
        ? 'border-ink bg-ink text-white'
        : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
    }`}
  >
    {children}
  </button>
);
