import React, { useState } from 'react';
import { FREQUENCIES, JOURNAL, SHOW_BY_ID } from '../data/shows';
import type { JournalPiece } from '../data/shows';
import { useReveal } from '../hooks/useReveal';
import { Frequency } from './Motifs';

const Piece: React.FC<{
  piece: JournalPiece;
  lead?: boolean;
  index: number;
  revealClass: (step?: number, base?: string) => string;
  revealStyle: (step?: number) => React.CSSProperties;
}> = ({ piece, lead = false, index, revealClass, revealStyle }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded || lead ? piece.body : piece.body.slice(0, 2);
  const hidden = piece.body.length - shown.length;

  return (
    <article
      className={`piece${lead ? ' piece--lead' : ''} ${revealClass(index)}`}
      style={revealStyle(index)}
      id={`journal-${piece.id}`}
    >
      <p className="meta">
        {piece.kind} · {piece.readTime} read
      </p>

      <h3 className="display-3 piece__title">
        <a href={`#index-${piece.about}`}>{piece.title}</a>
      </h3>

      <p className="body-editorial i" style={{ color: 'var(--ink-60)' }}>
        {piece.dek}
      </p>

      {lead && piece.pull ? (
        <blockquote className="pull">
          <p className="pull-quote">“{piece.pull}”</p>
          <footer className="meta">
            <cite>{piece.author}</cite> — on {SHOW_BY_ID[piece.about]?.title ?? 'the week in television'}
          </footer>
        </blockquote>
      ) : null}

      {shown.map((paragraph, i) => (
        <p className="piece__body" key={i}>
          {paragraph}
        </p>
      ))}

      <footer className="piece__foot">
        <span className="meta">
          {piece.author} · {piece.readTime}
        </span>
        {hidden > 0 ? (
          <button
            type="button"
            className="link"
            onClick={() => setExpanded(true)}
            aria-label={`Continue reading ${piece.title}`}
          >
            Continue →
          </button>
        ) : (
          <a className="link" href={`#index-${piece.about}`}>
            The entry →
          </a>
        )}
      </footer>
    </article>
  );
};

/**
 * §8.2 Critics’ journal — one lead piece with a pull quote, then two essays.
 * The lead runs wider than the essays; the grid is deliberately uneven (§8.3).
 */
const CriticsJournal: React.FC = () => {
  const { ref, revealClass, revealStyle } = useReveal<HTMLElement>();
  const [lead, ...rest] = JOURNAL;

  return (
    <section className="section" id="journal" aria-labelledby="journal-title" ref={ref}>
      <div className="shell">
        <div className="section-head">
          <div>
            <p className={`eyebrow ${revealClass(0)}`} style={revealStyle(0)}>
              Critics’ journal
            </p>
            <h2 className={`display-2 ${revealClass(1)}`} id="journal-title" style={revealStyle(1)}>
              This week’s criticism
            </h2>
          </div>
          <div className={`section-head__index ${revealClass(1)}`} style={revealStyle(1)}>
            <span className="mono-sm">
              {JOURNAL.length} pieces · written, not generated
            </span>
            <Frequency text={FREQUENCIES.journal} />
          </div>
        </div>

        <div className="journal__grid">
          <Piece
            piece={lead}
            lead
            index={2}
            revealClass={revealClass}
            revealStyle={revealStyle}
          />
          {rest.map((piece, i) => (
            <Piece
              key={piece.id}
              piece={piece}
              index={3 + i}
              revealClass={revealClass}
              revealStyle={revealStyle}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CriticsJournal;
