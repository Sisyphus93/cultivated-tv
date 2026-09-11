import React from 'react';

interface HeroProps {
  eyebrow: string;
  title: string;
  /** Four short right-aligned words, stacked (editorial flourish). */
  sideLines?: string[];
  imageSrc?: string;
  /** Drawn under the side lines. */
  sideNote?: React.ReactNode;
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  sideLines,
  imageSrc = '/hero-forest.jpg',
  sideNote,
}) => (
  <section className="mx-auto max-w-[1560px] px-6 pt-6 md:px-10 md:pt-8">
    <div className="relative overflow-hidden rounded-[12px] bg-[#2B302E]">
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover brightness-[0.82] saturate-[0.75]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/55 to-black/30" />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative flex min-h-[210px] flex-col justify-center px-7 py-12 sm:min-h-[240px] md:px-12 md:py-14 lg:min-h-[264px]">
        <p className="text-[10px] uppercase tracking-[0.34em] text-white/60 md:text-[11px]">
          {eyebrow}
        </p>
        <h1 className="mt-5 max-w-[18ch] font-display text-[32px] leading-[1.08] text-white sm:text-[44px] lg:text-[58px] xl:text-[68px]">
          {title}
        </h1>
        {sideNote && <div className="mt-6 lg:hidden">{sideNote}</div>}
      </div>

      {sideLines && (
        <div className="pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 flex-col items-end lg:flex lg:right-12">
          <div className="text-right text-[10px] uppercase leading-[2.15] tracking-[0.3em] text-white/75">
            {sideLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <span className="mt-5 block h-px w-11 bg-white/45" />
        </div>
      )}
    </div>
  </section>
);
