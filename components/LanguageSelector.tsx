import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Check, Search, X } from 'lucide-react';
import { ALL_LANGUAGES, PRIORITY_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  includedLangs: string[];
  excludedLangs: string[];
  onToggle: (langCode: string) => void;
  onClear: () => void;
}

type Lang = { code: string; name: string };

// The "All" pseudo-entry is rendered separately, keep it out of the list logic
const LANGUAGES: Lang[] = ALL_LANGUAGES.filter(l => l.code !== '');

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  includedLangs,
  excludedLangs,
  onToggle,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasIncludes = includedLangs.length > 0;
  const hasExcludes = excludedLangs.length > 0;
  const hasSelection = hasIncludes || hasExcludes;

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

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const nameOf = (code: string) => ALL_LANGUAGES.find(l => l.code === code)?.name || code.toUpperCase();

  const summarize = (codes: string[]) => {
    if (codes.length === 1) return nameOf(codes[0]);
    if (codes.length === 2) return `${nameOf(codes[0])} + ${nameOf(codes[1])}`;
    return `${nameOf(codes[0])} +${codes.length - 1}`;
  };

  const fullTitle = !hasSelection
    ? 'Language: all'
    : [
        hasIncludes ? `Read in: ${includedLangs.map(nameOf).join(', ')}` : null,
        hasExcludes ? `Excluding: ${excludedLangs.map(nameOf).join(', ')}` : null,
      ]
        .filter(Boolean)
        .join(' · ');

  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const matches = LANGUAGES.filter(
      lang => lang.name.toLowerCase().includes(query) || lang.code.toLowerCase().includes(query),
    );

    if (query) return matches;

    const priorityItems = PRIORITY_LANGUAGES.map(code => matches.find(l => l.code === code)).filter(
      (l): l is Lang => !!l,
    );

    const otherItems = matches
      .filter(l => !PRIORITY_LANGUAGES.includes(l.code))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { priority: priorityItems, others: otherItems };
  }, [searchQuery]);

  // Each click cycles: include → exclude → off
  const renderRow = (lang: Lang) => {
    const isIncluded = includedLangs.includes(lang.code);
    const isExcluded = excludedLangs.includes(lang.code);

    const stateClass = isIncluded
      ? 'font-bold text-ink'
      : isExcluded
      ? 'text-rustdeep line-through decoration-rust/60'
      : 'text-ink/72';

    return (
      <button
        key={lang.code}
        type="button"
        onClick={() => onToggle(lang.code)}
        aria-pressed={isIncluded ? true : isExcluded ? 'mixed' : false}
        title={isIncluded ? 'Included — click again to exclude' : isExcluded ? 'Excluded — click to clear' : 'Click to include'}
        className={`label-caps flex w-full items-center justify-between gap-2 px-4 py-2 text-left transition-colors duration-[180ms] ease-cabinet hover:bg-ink hover:text-paper ${stateClass}`}
      >
        <span className="truncate">{lang.name}</span>
        {isIncluded ? <Check size={12} className="flex-shrink-0" /> : null}
        {isExcluded ? <X size={12} className="flex-shrink-0" /> : null}
      </button>
    );
  };

  const renderList = () => {
    if (Array.isArray(filteredLanguages)) {
      return (
        <>
          {filteredLanguages.map(renderRow)}
          {filteredLanguages.length === 0 ? (
            <p className="label-caps px-4 py-3 text-center text-ink/62">No such language</p>
          ) : null}
        </>
      );
    }

    return (
      <>
        {filteredLanguages.priority.map(renderRow)}
        <span aria-hidden="true" className="mx-4 my-1 block h-px bg-ink/12" />
        {filteredLanguages.others.map(renderRow)}
      </>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={fullTitle}
        aria-expanded={isOpen}
        className="label-caps flex items-baseline gap-1.5 border-b border-ink/20 pb-0.5 text-ink/72 transition-colors duration-[180ms] ease-cabinet hover:border-ink/60 hover:text-ink"
      >
        <span className="text-ink/62">Read in:</span>
        {!hasSelection ? (
          <span className="font-bold text-ink">All</span>
        ) : (
          <span className="font-bold">
            {hasIncludes ? <span className="text-ink">{summarize(includedLangs)}</span> : null}
            {hasIncludes && hasExcludes ? <span className="mx-1 text-ink/62">·</span> : null}
            {hasExcludes ? (
              <span className="text-rustdeep line-through decoration-rust/60">− {summarize(excludedLangs)}</span>
            ) : null}
          </span>
        )}
      </button>

      {isOpen ? (
        <div className="panel animate-fade-in absolute left-0 top-full z-[100] mt-2 w-56 origin-top-left">
          <div className="flex items-center gap-2 border-b border-ink/15 px-3 py-2">
            <Search size={12} className="text-ink/62" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Find a language"
              aria-label="Find a language"
              className="label-caps w-full border-0 bg-transparent text-ink placeholder-ink/62 focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => {
                onClear();
                setIsOpen(false);
              }}
              className={`label-caps flex w-full items-center justify-between px-4 py-2 text-left transition-colors duration-[180ms] ease-cabinet hover:bg-ink hover:text-paper ${
                !hasSelection ? 'font-bold text-ink' : 'text-ink/72'
              }`}
            >
              All languages
              {!hasSelection ? <Check size={12} /> : null}
            </button>

            <span aria-hidden="true" className="mx-4 my-1 block h-px bg-ink/12" />

            {renderList()}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-ink/15 px-3 py-2">
            <span className="label-caps leading-tight text-ink/62">
              First click: read in
              <br />
              Second click: exclude
            </span>
            <span className="flex flex-shrink-0 items-center gap-3">
              {hasSelection ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="label-caps text-rustdeep transition-colors duration-[180ms] ease-cabinet hover:text-ink"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-rule !px-2 !py-0.5"
              >
                Done
              </button>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
