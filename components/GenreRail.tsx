import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { POPULAR_GENRES } from '../constants';
import { Chip, CircleButton } from './ui';

interface GenreRailProps {
  includedGenres: number[];
  excludedGenres: number[];
  onToggle: (genreId: number) => void;
  onClear: () => void;
}

export const GenreRail: React.FC<GenreRailProps> = ({
  includedGenres,
  excludedGenres,
  onToggle,
  onClear,
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateArrows();
    rail.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);

    return () => {
      rail.removeEventListener('scroll', updateArrows);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows]);

  const scrollRail = (direction: 1 | -1) => {
    railRef.current?.scrollBy({ left: direction * 340, behavior: 'smooth' });
  };

  const hasSelection = includedGenres.length > 0 || excludedGenres.length > 0;

  return (
    <div className="mx-auto max-w-[1560px] px-6 md:px-10">
      <div className="flex items-center gap-3">
        <div
          ref={railRef}
          className="no-scrollbar flex flex-1 items-center gap-2.5 overflow-x-auto py-1"
        >
          <Chip
            active={!hasSelection}
            onClick={onClear}
            title="Show every genre"
          >
            All
          </Chip>

          {POPULAR_GENRES.map((genre) => {
            const isIncluded = includedGenres.includes(genre.id);
            const isExcluded = excludedGenres.includes(genre.id);

            return (
              <Chip
                key={`${genre.id}-${genre.name}`}
                active={isIncluded}
                excluded={isExcluded}
                onClick={() => onToggle(genre.id)}
                title={
                  isIncluded
                    ? 'Included — click to exclude'
                    : isExcluded
                    ? 'Excluded — click to reset'
                    : 'Click to include'
                }
              >
                {genre.name}
              </Chip>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {canScrollLeft && (
            <CircleButton
              icon={ChevronLeft}
              label="Scroll genres left"
              onClick={() => scrollRail(-1)}
              className="animate-fade-in"
            />
          )}
          {canScrollRight && (
            <CircleButton
              icon={ChevronRight}
              label="Scroll genres right"
              onClick={() => scrollRail(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
