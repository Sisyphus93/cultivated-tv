import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TVShow } from '../types';
import { CircleButton, Eyebrow } from './ui';

interface MoreWorldsProps {
  recommendations: TVShow[];
  eyebrow: string;
  loading: boolean;
  onSelect: (show: TVShow) => void;
}

const SCROLL_STEP = 420;

export const MoreWorlds: React.FC<MoreWorldsProps> = ({
  recommendations,
  eyebrow,
  loading,
  onSelect,
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
  }, [updateArrows, recommendations, loading]);

  if (!loading && recommendations.length === 0) return null;

  const scrollRail = (direction: 1 | -1) => {
    railRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto mt-14 max-w-[1560px] px-6 md:mt-16 md:px-10">
      <div className="flex items-end justify-between gap-6">
        <div>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-3.5 font-display text-[28px] leading-none text-ink sm:text-[34px] lg:text-[38px]">
            More Worlds to Explore
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <CircleButton
            icon={ChevronLeft}
            label="Scroll backwards"
            onClick={() => scrollRail(-1)}
            disabled={!canScrollLeft}
          />
          <CircleButton
            icon={ChevronRight}
            label="Scroll forwards"
            onClick={() => scrollRail(1)}
            disabled={!canScrollRight}
          />
        </div>
      </div>

      <div
        ref={railRef}
        className="no-scrollbar mt-8 flex items-stretch gap-5 overflow-x-auto pb-1"
      >
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="aspect-[2/3] w-[150px] shrink-0 animate-shimmer rounded-[12px] bg-[#EAE6DF] sm:w-[176px]"
            />
          ))}

        {!loading &&
          recommendations.map((show) => (
            <button
              key={show.id}
              type="button"
              onClick={() => onSelect(show)}
              title={`Explore ${show.name}`}
              className="group w-[150px] shrink-0 sm:w-[176px]"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-[12px] border border-line bg-[#EDE9E2] shadow-poster">
                {show.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${show.poster_path}`}
                    alt={show.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center p-3 text-center text-[10px] uppercase tracking-[0.16em] text-faint">
                    {show.name}
                  </span>
                )}
              </div>
            </button>
          ))}

        {!loading && (
          <div className="relative flex w-[300px] shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-line bg-[#23271F] px-8 text-center sm:w-[400px]">
            <img
              src="/hero-forest.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative animate-fade-in">
              <p className="font-display text-[13px] uppercase leading-[2.05] tracking-[0.16em] text-white/90 sm:text-[14.5px]">
                “Great television
                <br />
                stays with you.”
              </p>
              <span className="mx-auto mt-5 block h-px w-10 bg-white/45" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
