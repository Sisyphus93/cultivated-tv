import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Search, Check, X } from 'lucide-react';
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

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ includedLangs, excludedLangs, onToggle, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasIncludes = includedLangs.length > 0;
  const hasExcludes = excludedLangs.length > 0;
  const hasSelection = hasIncludes || hasExcludes;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus search input when opened / reset search on close
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
        setSearchQuery(''); // Reset search on close
    }
  }, [isOpen]);

  const nameOf = (code: string) => ALL_LANGUAGES.find(l => l.code === code)?.name || code.toUpperCase();

  // Compact summary: "English + Japanese" / "English +2" / "Hindi +1"
  const summarize = (codes: string[]) => {
    if (codes.length === 1) return nameOf(codes[0]);
    if (codes.length === 2) return `${nameOf(codes[0])} + ${nameOf(codes[1])}`;
    return `${nameOf(codes[0])} +${codes.length - 1}`;
  };

  // Full breakdown for the tooltip
  const fullTitle = !hasSelection
    ? 'Language: All'
    : [
        hasIncludes ? `Include: ${includedLangs.map(nameOf).join(', ')}` : null,
        hasExcludes ? `Exclude: ${excludedLangs.map(nameOf).join(', ')}` : null,
      ].filter(Boolean).join(' | ');

  // Sorting and Filtering Logic
  const filteredLanguages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Filter first based on search
    const matches = LANGUAGES.filter(lang =>
      lang.name.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query)
    );

    // If searching, just show matches (skip priority grouping to keep it simple)
    if (query) return matches;

    // If NO search, apply the Priority Grouping Logic
    const priorityItems = PRIORITY_LANGUAGES
        .map(code => matches.find(l => l.code === code))
        .filter((l): l is Lang => !!l);

    const otherItems = matches
        .filter(l => !PRIORITY_LANGUAGES.includes(l.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    return {
        priority: priorityItems,
        others: otherItems
    };
  }, [searchQuery]);

  // Shared row renderer. Each click cycles: include -> exclude -> off
  const renderRow = (lang: Lang) => {
    const isIncluded = includedLangs.includes(lang.code);
    const isExcluded = excludedLangs.includes(lang.code);

    const stateClass = isIncluded
        ? 'text-white font-bold'
        : isExcluded
        ? 'text-red-400 line-through decoration-red-600'
        : 'text-gray-500';

    return (
        <button
            key={lang.code}
            onClick={() => onToggle(lang.code)}
            title={isIncluded ? 'Included — click to exclude' : isExcluded ? 'Excluded — click to remove' : 'Click to include'}
            className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center gap-2 ${stateClass}`}
        >
            <span className="truncate">{lang.name}</span>
            {isIncluded && <Check size={12} className="flex-shrink-0" />}
            {isExcluded && <X size={12} className="flex-shrink-0 text-red-500" />}
        </button>
    );
  };

  const renderList = () => {
    // Render logic for Search Mode (Flat List)
    if (Array.isArray(filteredLanguages)) {
        return (
            <>
                {filteredLanguages.map(renderRow)}
                {/* Empty State */}
                {filteredLanguages.length === 0 && (
                    <div className="px-4 py-3 text-[10px] text-gray-600 font-mono uppercase text-center">
                        No matching language
                    </div>
                )}
            </>
        );
    }

    // Render logic for Default Mode (Grouped)
    return (
        <>
            {/* Priority List */}
            {filteredLanguages.priority.map(renderRow)}

            <div className="h-px bg-gray-800 mx-4 my-1" />

            {/* The Rest */}
            {filteredLanguages.others.map(renderRow)}
        </>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={fullTitle}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
            <Globe size={14} className={hasSelection ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'} />
            <span className="text-[10px] font-mono uppercase tracking-widest border-b border-transparent group-hover:border-gray-500 pb-0.5">
                <span className="text-gray-500 group-hover:text-gray-400 transition-colors">Language: </span>
                {!hasSelection ? (
                    <span className="text-white font-bold">All</span>
                ) : (
                    <span className="font-bold">
                        {hasIncludes && <span className="text-white">{summarize(includedLangs)}</span>}
                        {hasIncludes && hasExcludes && <span className="text-gray-600 mx-0.5">·</span>}
                        {hasExcludes && (
                            <span className="text-red-500 line-through decoration-red-900 decoration-2">− {summarize(excludedLangs)}</span>
                        )}
                    </span>
                )}
            </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-gray-800 shadow-2xl z-[100] animate-fade-in origin-top-left">
          {/* Search Header */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800">
            <Search size={12} className="text-gray-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="bg-transparent border-none text-white text-xs font-mono w-full focus:outline-none placeholder-gray-700 uppercase"
            />
          </div>

          {/* List */}
          <div className="max-h-60 overflow-y-auto py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-600">
             {/* 'All' Option - clears both include & exclude */}
             <button
                onClick={() => {
                    onClear();
                    setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${!hasSelection ? 'text-white font-bold' : 'text-gray-500'}`}
             >
                All
                {!hasSelection && <Check size={12} />}
             </button>

             <div className="h-px bg-gray-800 mx-4 my-1" />

             {renderList()}
          </div>

          {/* Footer: hint + actions */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-800">
            <span className="text-[8px] text-gray-600 font-mono uppercase tracking-widest leading-tight">
                1st click: include<br />2nd click: exclude
            </span>
            <div className="flex items-center gap-3 flex-shrink-0">
                {hasSelection && (
                    <button
                        onClick={onClear}
                        className="text-[9px] font-mono uppercase tracking-widest text-red-500/70 hover:text-red-500 transition-colors"
                    >
                        Clear
                    </button>
                )}
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-[9px] font-mono uppercase tracking-widest text-gray-400 hover:text-white border border-gray-800 hover:border-gray-500 px-2 py-0.5 transition-colors"
                >
                    Done
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
