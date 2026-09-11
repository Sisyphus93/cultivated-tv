import React from 'react';
import { ArrowDown, Bookmark, Loader2 } from 'lucide-react';
import { TVShow } from '../types';
import { useShowDetails } from '../hooks/useShowDetails';
import { Stamp, stampFor } from './Stamp';
import { Marginalia } from './Marginalia';
import { blurb, dateline, formatHours, langCode, toRoman, yearOf } from '../utils/editorial';

interface HeroProps {
  leadShow: TVShow | null;
  apiKey: string | null;
  issue: number;
  isSaved: boolean;
  onSave: (show: TVShow, bingeHours?: number) => void;
  onRemove: (id: number) => void;
}

/**
 * The Cabinet — the hero.
 *
 * Left: an oversized italic display headline set like a book title page, with
 * the issue number, dateline and editor as marginalia. Right: the lead review,
 * with a film-still plate treatment and a roman-numeral episode indicator.
 */
export const Hero: React.FC<HeroProps> = ({ leadShow, apiKey, issue, isSaved, onSave, onRemove }) => {
  const details = useShowDetails(apiKey, leadShow?.id ?? null);
  const year = yearOf(leadShow?.first_air_date);
  const stamp = leadShow
    ? stampFor({
        first_air_date: leadShow.first_air_date,
        vote_average: leadShow.vote_average,
        vote_count: leadShow.vote_count,
        status: details.status,
        last_air_date: details.lastAirDate,
        bingeHours: details.bingeHours,
      })
    : null;

  const seasonRoman = details.seasonCount ? toRoman(details.seasonCount) : null;
  const episodeRoman = details.episodeCount ? toRoman(details.episodeCount) : null;

  return (
    <header className="animate-rise grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
      {/* ---- Title page ---- */}
      <div className="lg:col-span-5">
        <Marginalia as="p" className="mb-6">
          Issue No. {toRoman(issue)} · {dateline('Berlin')}
        </Marginalia>

        <h2 className="font-display display-wonk text-[clamp(2.9rem,7.2vw,5.4rem)] font-light italic leading-[0.94] tracking-tighter2 text-ink">
          Television,
          <br />
          <span className="text-rustdeep">read slowly.</span>
        </h2>

        <p className="mt-7 measure text-[16.5px] leading-[1.65] text-ink/85">
          A quarterly-shaped journal for people who would rather choose one thing and
          finish it than scroll past forty. Every entry here was filed by hand, with the
          runtime printed alongside the praise — so the commitment is never a surprise.
        </p>

        <p className="mt-5 font-display text-[17px] italic leading-snug text-ink/72">
          &ldquo;Not a streaming service. A reading room with screens.&rdquo;
        </p>

        <div className="mt-8 flex items-center gap-4">
          <span aria-hidden="true" className="h-px w-10 bg-ink/30" />
          <Marginalia>ed. M. R. · set in Fraunces &amp; Inter</Marginalia>
        </div>
      </div>

      {/* ---- The lead review ---- */}
      <div className="lg:col-span-7">
        <div className="flex items-baseline justify-between gap-4">
          <Marginalia as="p" className="text-rustdeep">
            The lead review
          </Marginalia>
          <Marginalia as="p">p. 001</Marginalia>
        </div>

        <div className="ink-rule mt-2" />

        {leadShow ? (
          <article className="mt-6">
            <div className="relative">
              <div className="leaflet-frame overflow-hidden bg-paper2">
                {leadShow.backdrop_path || leadShow.poster_path ? (
                  <>
                    <img
                      src={`https://image.tmdb.org/t/p/w1280${leadShow.backdrop_path || leadShow.poster_path}`}
                      alt={`Still from ${leadShow.name}`}
                      className="plate aspect-[16/9] w-full object-cover"
                    />
                    <span aria-hidden="true" className="plate-wash pointer-events-none absolute inset-0" />
                    <span aria-hidden="true" className="plate-bleed pointer-events-none absolute inset-0" />
                  </>
                ) : (
                  <div className="grid aspect-[16/9] w-full place-items-center">
                    <p className="font-display text-2xl italic text-ink/62">{leadShow.name}</p>
                  </div>
                )}
              </div>

              {stamp ? (
                <div className="absolute -bottom-6 right-6 z-10">
                  <Stamp label={stamp.label} tone={stamp.tone} />
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
              <div className="min-w-0">
                <h3 className="font-display display-soft text-[clamp(1.9rem,3.4vw,2.7rem)] font-light italic leading-[1.05] tracking-hair">
                  {leadShow.name}
                </h3>
                <Marginalia as="p" className="mt-2">
                  {year} · {langCode(leadShow.original_language)}
                  {details.creators.length > 0 ? ` · by ${details.creators.slice(0, 2).join(' & ')}` : ''}
                </Marginalia>
              </div>

              {/* Roman-numeral episode indicator */}
              <dl className="flex items-end gap-5">
                <div className="flex flex-col text-right">
                  <dt className="label-caps order-2 mt-1 text-ink/62">Seasons</dt>
                  <dd className="order-1 font-display display-wonk text-[26px] leading-none text-ink">
                    {seasonRoman ?? '—'}
                  </dd>
                </div>
                <span aria-hidden="true" className="rule-vertical mb-6 h-8" />
                <div className="flex flex-col text-right">
                  <dd className="font-display display-wonk text-[26px] leading-none text-ink">
                    {details.loading ? <Loader2 size={16} className="ml-auto animate-spin" /> : episodeRoman ?? '—'}
                  </dd>
                  <dt className="label-caps mt-1 text-ink/62">Episodes</dt>
                </div>
                {details.avgRuntime ? (
                  <>
                    <span aria-hidden="true" className="rule-vertical mb-6 h-8" />
                    <div className="flex flex-col text-right">
                      <dt className="label-caps order-2 mt-1 text-ink/62">Minutes each</dt>
                      <dd className="order-1 font-display display-wonk text-[26px] leading-none text-ink">
                        {Math.round(details.avgRuntime)}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>
            </div>

            <p className="mt-5 max-w-[62ch] text-[16.5px] leading-[1.65] text-ink/85 line-clamp-3">
              {blurb(leadShow.overview, 3)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ink/12 pt-5">
              <a href={`#entry-${leadShow.id}`} className="btn-ink">
                <ArrowDown size={11} />
                Read the entry
              </a>
              {details.bingeHours ? (
                <span className="data-chip" title="Estimated total runtime, all episodes">
                  {formatHours(details.bingeHours)} to finish
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => (isSaved ? onRemove(leadShow.id) : onSave(leadShow, details.bingeHours ?? undefined))}
                className={`btn-rule ${isSaved ? 'border-rust text-rustdeep' : ''}`}
                aria-pressed={isSaved}
              >
                <Bookmark size={11} fill={isSaved ? 'currentColor' : 'none'} />
                {isSaved ? 'Shelved' : 'Shelve'}
              </button>
            </div>
          </article>
        ) : (
          <div className="mt-6 border border-ink/15 bg-paper2 p-8">
            <p aria-hidden="true" className="ornament mb-4">
              ✦
            </p>
            <p className="font-display text-xl italic leading-snug text-ink/72">
              The lead is being set. While the plates warm, the rest of the issue is
              already below — filed, numbered and timed to the minute.
            </p>
          </div>
        )}
      </div>
    </header>
  );
};
