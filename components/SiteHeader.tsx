import React, { useEffect, useRef, useState } from 'react';
import { KeyRound, Search, Sparkles, User, X } from 'lucide-react';

type ViewMode = 'discover' | 'watchlist';

interface SiteHeaderProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  watchlistCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  isDemoMode: boolean;
  onLogoClick: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  onResetKey: () => void;
}

const NavTab: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}> = ({ active, onClick, children, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative pb-1.5 text-[11.5px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
      active ? 'text-ink' : 'text-muted hover:text-ink'
    }`}
  >
    {children}
    {typeof count === 'number' && (
      <span className={`ml-2 text-[10px] tabular-nums ${active ? 'text-muted' : 'text-faint'}`}>
        {count}
      </span>
    )}
    <span
      className={`absolute -bottom-[3px] left-0 h-[2px] w-full bg-ink transition-opacity duration-200 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  </button>
);

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  viewMode,
  onViewChange,
  watchlistCount,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  isDemoMode,
  onLogoClick,
  onResetKey,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1560px] flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4 md:px-10 lg:h-[88px] lg:flex-nowrap lg:gap-x-8 lg:py-0 xl:gap-x-12">
        {/* Wordmark */}
        <a
          href="/"
          onClick={onLogoClick}
          className="order-1 mr-auto flex shrink-0 flex-col rounded-sm outline-none focus-visible:ring-1 focus-visible:ring-line-strong lg:order-none"
        >
          <span className="font-display text-[19px] leading-none tracking-[0.2em] text-ink sm:text-[21px] lg:text-[22px] lg:tracking-[0.21em] xl:text-[26px]">
            CULTIVATED TV
          </span>
          <span className="mt-2 text-[8px] uppercase tracking-[0.4em] text-muted md:text-[9px] xl:text-[10px]">
            Stories worth your time
          </span>
        </a>

        {/* View tabs */}
        <nav className="order-3 flex w-full items-center gap-8 lg:order-none lg:w-auto lg:gap-12">
          <NavTab active={viewMode === 'discover'} onClick={() => onViewChange('discover')}>
            Discover
          </NavTab>
          <NavTab
            active={viewMode === 'watchlist'}
            onClick={() => onViewChange('watchlist')}
            count={watchlistCount}
          >
            My List
          </NavTab>
        </nav>

        {/* Search */}
        <div className="order-4 w-full lg:order-none lg:ml-auto lg:w-[264px] xl:w-[360px] 2xl:w-[404px]">
          <div className="flex h-11 items-center gap-3 rounded-full border border-line bg-surface pl-1.5 pr-4 transition-colors duration-200 focus-within:border-line-strong hover:border-line-strong">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-muted">
              <Search size={14} strokeWidth={2} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="w-full min-w-0 bg-transparent text-[14px] text-ink placeholder:text-faint focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="text-muted transition-colors hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Account */}
        <div className="relative order-2 lg:order-none" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Account and API key"
            aria-expanded={menuOpen}
            className={`flex h-11 w-11 items-center justify-center rounded-full border bg-surface transition-colors duration-200 ${
              menuOpen ? 'border-line-strong text-ink' : 'border-line text-ink-soft hover:border-line-strong hover:text-ink'
            }`}
          >
            <User size={17} strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-3 w-[264px] animate-fade-in rounded-2xl border border-line bg-surface p-2 shadow-pop">
              <div className="px-3 py-2.5">
                <p className="text-[9.5px] uppercase tracking-[0.26em] text-faint">Connection</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-semibold text-ink">
                  {isDemoMode ? <Sparkles size={13} className="text-gold" /> : <KeyRound size={13} className="text-muted" />}
                  {isDemoMode ? 'Demo key' : 'Your TMDb key'}
                </p>
              </div>
              <div className="my-1 h-px bg-line" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onResetKey();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
              >
                <KeyRound size={14} className="text-muted" />
                Reset API key
              </button>
              <a
                href="https://www.themoviedb.org/settings/api"
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[12.5px] text-ink-soft transition-colors hover:bg-paper hover:text-ink"
              >
                <Sparkles size={14} className="text-muted" />
                Get a free key
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
