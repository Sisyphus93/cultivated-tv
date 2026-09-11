import React from 'react';
import { Marginalia } from './Marginalia';
import { readingTime } from '../utils/editorial';

/** Word count kept honest: this is the actual text below, give or take a line. */
const WORD_COUNT = 372;

/**
 * Editor's Desk — the essay department. Static by design: nothing here is
 * generated, ranked or personalised. It is written, and it stays written.
 */
export const EditorDesk: React.FC = () => (
  <div className="grid grid-cols-1 gap-x-14 gap-y-10 lg:grid-cols-12">
    <div className="lg:col-span-4">
      <Marginalia as="p" className="text-rustdeep">
        Department III
      </Marginalia>
      <h2 id="desk-title" className="mt-3 font-display display-soft text-[clamp(1.9rem,3.2vw,2.6rem)] font-light italic leading-[1.05] tracking-hair">
        Editor&rsquo;s Desk
      </h2>
      <p className="mt-3 font-display text-[17px] italic leading-snug text-ink/72">
        On the pleasure of choosing badly, on purpose, and finishing anyway.
      </p>

      <div className="mt-6 flex flex-col gap-1.5">
        <Marginalia>{readingTime(WORD_COUNT)}</Marginalia>
        <Marginalia>ed. M. R.</Marginalia>
        <Marginalia>Filed from Berlin</Marginalia>
      </div>

      <blockquote className="mt-8 border-l border-rust pl-5">
        <p className="pull-quote">
          The algorithm is not wrong about you. It is wrong about television.
        </p>
      </blockquote>
    </div>

    <div className="lg:col-span-8">
      <div className="ink-rule mb-8 hidden lg:block" />

      <div className="columns-1 gap-12 md:columns-2 md:[column-fill:balance]">
        <p className="drop-cap mb-5 text-[16px] leading-[1.68] text-ink/88">
          Somewhere around the fortieth thumbnail, browsing stops being a search and
          becomes a symptom. You are no longer looking for something to watch; you are
          looking for permission to stop looking. Every service is built around that
          fatigue, because a tired viewer accepts the first thing that is merely
          acceptable.
        </p>

        <p className="mb-5 text-[16px] leading-[1.68] text-ink/88">
          This journal takes the opposite position. A show is a piece of writing with a
          duration, and the duration matters. Twelve hours is a week of evenings. If you
          know that going in, you can decide — actually decide, with your eyes open —
          whether it is worth the week. That is the whole of our thesis, printed on every
          entry we file.
        </p>

        <p className="mb-5 text-[16px] leading-[1.68] text-ink/88">
          The second part is harder. Recommendations flatter; they hand you more of what
          already agreed with you. Criticism is less comfortable and more useful, because
          it describes the thing rather than your taste. So our entries name what a show
          is patient about, what it is thin on, and who it is for.
        </p>

        <p className="mb-5 text-[16px] leading-[1.68] text-ink/88">
          <em>A quiet procedural about a translator who can&rsquo;t stop listening. Four
          perfect episodes.</em> That is the shape of a useful note. It tells you the tone,
          the scale and the commitment in two sentences, and it does not tell you how to
          feel about it.
        </p>

        <p className="mb-5 text-[16px] leading-[1.68] text-ink/88">
          We publish no star ratings, because a number is a rumour with decimal places.
          We publish the vote average TMDb files, small and grey, as an archivist would
          print an accession number — evidence, not verdict.
        </p>

        <p className="text-[16px] leading-[1.68] text-ink/88">
          <em>What it lacks in plot, it returns in patience. Best watched alone.</em> If a
          note can tell you that, it has done more for your evening than any confidence
          score ever will. Choose one thing. Finish it. Then come back and argue with us
          about it.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <span aria-hidden="true" className="h-px w-10 bg-ink/30" />
        <Marginalia>M. R. — editor, Cabinet</Marginalia>
      </div>
    </div>
  </div>
);
