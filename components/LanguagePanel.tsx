import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { ALL_LANGUAGES, PRIORITY_LANGUAGES } from '../constants';

type Lang = { code: string; name: string };

interface LanguagePanelProps {
  includedLangs: string[];
  excludedLangs: string[];
  onToggle: (langCode: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

// The "All" pseudo-entry is rendered separately, keep it out of the list logic
const LANGUAGES: Lang[] = ALL_LANGUAGES.filter((lang) => lang.code !== '');

export const languageName = (code: string) =>
  ALL_LANGUAGES.find((lang) => lang.code === code)?.name || code.toUpperCase();

/** Compact summary for the trigger pill: "English" / "English + Japanese" / "English +3" */
export const summarizeLanguages = (codes: string[]) => {
  if (codes.length === 0) return 'All';
  if (codes.length === 1) return languageName(codes[0]);
  if (codes.length === 2) return `${languageName(codes[0])} + ${languageName(codes[1])}`;
  return `${languageName(codes[0])} +${codes.length - 1}`;
};

/** Full tooltip breakdown of the current language state. */
export const languageTitle = (included: string[], excluded: string[]) => {
  if (included.length === 0 && excluded.length === 0) return 'Language: All';
  return [
    included.length > 0 ? `Include: ${included.map(languageName).join(', ')}` : null,
    excluded.length > 0 ? `Exclude: ${excluded.map(languageName).join(', ')}` : null,
  ]
    .filter(Boolean)
    .join(' | ');
};

export const LanguagePanel: React.FC<LanguagePanelProps> = ({
  includedLangs,
  excludedLangs,
  onToggle,
  onClear,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const hasSelection = includedLangs.length > 0 || excludedLangs.length > 0;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = LANGUAGES.filter(
      (lang) =>
        lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query)
    );

    // While searching show a flat list, otherwise group the popular languages first
    if (query) return matches;

    const priority = PRIORITY_LANGUAGES.map((code) =>
      matches.find((lang) => lang.code === code)
    ).filter((lang): lang is Lang => Boolean(lang));

    const others = matches
      .filter((lang) => !PRIORITY_LANGUAGES.includes(lang.code))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { priority, others };
  }, [searchQuery]);

  const renderRow = (lang: Lang) => {
    const isIncluded = includedLangs.includes(lang.code);
    const isExcluded = excludedLangs.includes(lang.code);

    return (
      <button
        key={lang.code}
        type="button"
        onClick={() => onToggle(lang.code)}
        title={
          isIncluded
            ? 'Included — click to exclude'
            : isExcluded
            ? 'Excluded — click to reset'
            : 'Click to include'
        }
        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors duration-150 ${
          isIncluded
            ? 'bg-ink font-medium text-white'
            : isExcluded
            ? 'text-negative hover:bg-negative/[0.06]'
            : 'text-ink-soft hover:bg-paper hover:text-ink'
        }`}
      >
        <span className={`truncate ${isExcluded ? 'line-through decoration-negative/50' : ''}`}>
          {lang.name}
        </span>
        {isIncluded && <Check size={13} className="shrink-0" />}
        {isExcluded && <X size={13} className="shrink-0" />}
      </button>
    );
  };

  const renderList = () => {
    if (Array.isArray(filteredLanguages)) {
      return (
        <>
          {filteredLanguages.map(renderRow)}
          {filteredLanguages.length === 0 && (
            <p className="px-3 py-4 text-center text-[11px] uppercase tracking-[0.16em] text-faint">
              No matching language
            </p>
          )}
        </>
      );
    }

    return (
      <>
        {filteredLanguages.priority.map(renderRow)}
        <div className="mx-3 my-1.5 h-px bg-line" />
        {filteredLanguages.others.map(renderRow)}
      </>
    );
  };

  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2">
        <Search size={13} className="text-faint" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search languages…"
          className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-faint focus:outline-none"
        />
      </div>

      <div className="thin-scrollbar mt-2 max-h-[248px] overflow-y-auto pr-1">
        <button
          type="button"
          onClick={onClear}
          className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-[12.5px] transition-colors duration-150 ${
            !hasSelection ? 'bg-ink font-medium text-white' : 'text-ink-soft hover:bg-paper hover:text-ink'
          }`}
        >
          All languages
          {!hasSelection && <Check size={13} />}
        </button>
        <div className="mx-3 my-1.5 h-px bg-line" />
        {renderList()}
      </div>

      <div className="mt-3 flex items-center justify-between gap-4 border-t border-line pt-3">
        <span className="text-[9.5px] uppercase leading-relaxed tracking-[0.14em] text-faint">
          Click once to include
          <br />
          twice to exclude
        </span>
        <div className="flex shrink-0 items-center gap-3">
          {hasSelection && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-negative"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-line px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
