import React, { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

interface FilterPillProps {
  icon: LucideIcon;
  /** Colour class for the leading icon (e.g. gold star, muted globe). */
  iconClassName?: string;
  /** Muted prefix, e.g. "Rating". */
  label?: string;
  /** Emphasised value, e.g. ">= 5". */
  value: React.ReactNode;
  title?: string;
  /** Marks the pill as carrying a non-default value. */
  active?: boolean;
  align?: 'left' | 'right';
  /** Tailwind width class for the popover panel. */
  panelClassName?: string;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}

/**
 * Pill-shaped filter trigger with a light popover panel.
 * Closes on outside click / Escape.
 */
export const FilterPill: React.FC<FilterPillProps> = ({
  icon: Icon,
  iconClassName = 'text-muted',
  label,
  value,
  title,
  active,
  align = 'left',
  panelClassName = 'w-[300px]',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        title={title}
        aria-expanded={open}
        className={`flex h-10 items-center gap-2.5 rounded-full border bg-surface px-4 text-[12.5px] transition-colors duration-200 lg:gap-3 lg:px-5 lg:text-[13.5px] ${
          open || active
            ? 'border-line-strong text-ink'
            : 'border-line text-ink-soft hover:border-line-strong'
        }`}
      >
        <Icon size={15} className={iconClassName} />
        {label && <span className="text-muted">{label}</span>}
        <span className="font-semibold text-ink">{value}</span>
        <ChevronDown
          size={14}
          className={`text-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-full z-50 mt-2 animate-fade-in rounded-2xl border border-line bg-surface p-5 shadow-pop ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {typeof children === 'function' ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
};
