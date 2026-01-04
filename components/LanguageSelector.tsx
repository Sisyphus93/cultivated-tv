import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, Search, Check, ChevronDown } from 'lucide-react';
import { ALL_LANGUAGES, PRIORITY_LANGUAGES } from '../constants';

interface LanguageSelectorProps {
  selectedLang: string;
  onSelect: (langCode: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLang, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isOpen) {
        setSearchQuery(''); // Reset search on close
    }
  }, [isOpen]);

  const selectedName = ALL_LANGUAGES.find(l => l.code === selectedLang)?.name || 'All';

  // Sorting and Filtering Logic
  const filteredLanguages = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    // Filter first based on search
    const matches = ALL_LANGUAGES.filter(lang => 
      lang.name.toLowerCase().includes(query) || 
      lang.code.toLowerCase().includes(query)
    );

    // If searching, just show matches (skip priority grouping to keep it simple)
    if (searchQuery) return matches;

    // If NO search, apply the Priority Grouping + Separator Logic
    const allOption = matches.find(l => l.code === '');
    const priorityItems = PRIORITY_LANGUAGES
        .map(code => matches.find(l => l.code === code))
        .filter((l): l is typeof ALL_LANGUAGES[0] => !!l);
    
    const otherItems = matches
        .filter(l => l.code !== '' && !PRIORITY_LANGUAGES.includes(l.code))
        .sort((a, b) => a.name.localeCompare(b.name));

    return {
        isGrouped: true,
        all: allOption,
        priority: priorityItems,
        others: otherItems
    };
  }, [searchQuery]);

  const renderList = () => {
    // Render logic for Search Mode (Flat List)
    if (Array.isArray(filteredLanguages)) {
        return filteredLanguages.map(lang => (
            <button
                key={lang.code}
                onClick={() => {
                    onSelect(lang.code);
                    setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${lang.code === selectedLang ? 'text-white' : 'text-gray-500'}`}
            >
                {lang.name}
                {lang.code === selectedLang && <Check size={12} />}
            </button>
        ));
    }

    // Render logic for Default Mode (Grouped)
    return (
        <>
            {/* 'All' Option */}
            {filteredLanguages.all && (
                 <button
                    onClick={() => {
                        onSelect(filteredLanguages.all!.code);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${filteredLanguages.all.code === selectedLang ? 'text-white' : 'text-gray-500'}`}
                >
                    {filteredLanguages.all.name}
                    {filteredLanguages.all.code === selectedLang && <Check size={12} />}
                </button>
            )}
            
            <div className="h-px bg-gray-800 mx-4 my-1" />

            {/* Priority List */}
            {filteredLanguages.priority.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => {
                        onSelect(lang.code);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${lang.code === selectedLang ? 'text-white' : 'text-gray-500'}`}
                >
                    {lang.name}
                    {lang.code === selectedLang && <Check size={12} />}
                </button>
            ))}

            <div className="h-px bg-gray-800 mx-4 my-1" />

            {/* The Rest */}
            {filteredLanguages.others.map(lang => (
                <button
                    key={lang.code}
                    onClick={() => {
                        onSelect(lang.code);
                        setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex justify-between items-center ${lang.code === selectedLang ? 'text-white' : 'text-gray-500'}`}
                >
                    {lang.name}
                    {lang.code === selectedLang && <Check size={12} />}
                </button>
            ))}
        </>
    );
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
      >
        <div className="flex items-center gap-2">
            <Globe size={14} className={selectedLang ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'} />
            <span className={`text-[10px] font-mono uppercase tracking-widest border-b border-transparent group-hover:border-gray-500 pb-0.5 ${selectedLang ? 'text-white font-bold' : ''}`}>
                Language: {selectedName}
            </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-[#111] border border-gray-800 shadow-2xl z-50 animate-fade-in origin-top-left">
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
          <div className="max-h-60 overflow-y-auto py-1">
             {renderList()}
             {/* Empty State */}
             {Array.isArray(filteredLanguages) && filteredLanguages.length === 0 && (
                <div className="px-4 py-3 text-[10px] text-gray-600 font-mono uppercase text-center">
                    No matching language
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};