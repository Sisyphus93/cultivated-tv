import React from 'react';
import { Check } from 'lucide-react';
import { SORT_OPTIONS } from '../constants';

interface SortOption {
  value: string;
  label: string;
}

interface SortPanelProps {
  selectedSort: string;
  onSelect: (sortValue: string) => void;
  options?: SortOption[];
  onClose?: () => void;
}

export const sortLabel = (options: SortOption[], value: string) =>
  options.find((option) => option.value === value)?.label || 'Newest';

export const SortPanel: React.FC<SortPanelProps> = ({
  selectedSort,
  onSelect,
  options,
  onClose,
}) => {
  const activeOptions = options || SORT_OPTIONS;

  return (
    <div>
      <p className="px-3 pb-2 pt-1 text-[9.5px] uppercase tracking-[0.26em] text-faint">
        Order results by
      </p>
      <div className="space-y-0.5">
        {activeOptions.map((option) => {
          const isActive = option.value === selectedSort;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onSelect(option.value);
                onClose?.();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-[12.5px] transition-colors duration-150 ${
                isActive
                  ? 'bg-ink font-medium text-white'
                  : 'text-ink-soft hover:bg-paper hover:text-ink'
              }`}
            >
              {option.label}
              {isActive && <Check size={13} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
