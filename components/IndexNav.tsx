import React from 'react';
import { Marginalia } from './Marginalia';

export type SectionId = 'rotation' | 'index' | 'desk' | 'collections' | 'colophon';

export const SECTIONS: Array<{ id: SectionId; numeral: string; label: string; note: string }> = [
  { id: 'rotation', numeral: 'I', label: 'In Rotation', note: 'currently watching' },
  { id: 'index', numeral: 'II', label: 'The Index', note: 'browse all' },
  { id: 'desk', numeral: 'III', label: "Editor's Desk", note: 'essays' },
  { id: 'collections', numeral: 'IV', label: 'Late Night, Loud Volume', note: 'by mood' },
  { id: 'colophon', numeral: 'V', label: 'Colophon', note: 'how this is made' },
];

interface IndexNavProps {
  active: SectionId;
  onNavigate: (id: SectionId) => void;
  rotationCount: number;
  indexCount: number;
}

/**
 * The Index — a vertical table of contents for the journal.
 * Roman-numeralled chapters; the section you are in is set in italic under a
 * hand-drawn line. Nothing here is a pill, and nothing here is animated.
 */
export const IndexNav: React.FC<IndexNavProps> = ({ active, onNavigate, rotationCount, indexCount }) => (
  <nav aria-label="Contents" className="lg:sticky lg:top-28">
    <Marginalia as="p" className="mb-4">
      Contents
    </Marginalia>

    <ol className="flex flex-row flex-wrap gap-x-6 gap-y-2 lg:flex-col lg:gap-y-0">
      {SECTIONS.map(section => {
        const isActive = active === section.id;
        const count =
          section.id === 'rotation' ? rotationCount : section.id === 'index' ? indexCount : null;

        return (
          <li key={section.id} className="lg:border-b lg:border-ink/10">
            <button
              type="button"
              onClick={() => onNavigate(section.id)}
              aria-current={isActive ? 'true' : undefined}
              className="group flex w-full items-baseline gap-3 py-2.5 text-left transition-colors duration-[180ms] ease-cabinet"
            >
              <span
                className={`font-display display-wonk w-5 flex-shrink-0 text-[13px] ${
                  isActive ? 'text-rustdeep' : 'text-ink/62'
                }`}
              >
                {section.numeral}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={`hand-underline block text-[15px] leading-tight ${
                    isActive
                      ? 'font-display italic text-ink'
                      : 'font-sans text-ink/72 group-hover:text-ink'
                  }`}
                >
                  {section.label}
                </span>
                <span className="label-caps mt-0.5 block text-ink/62">{section.note}</span>
              </span>
              {count !== null ? (
                <span className="label-caps flex-shrink-0 text-ink/62">{count}</span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ol>

    <div className="mt-6 hidden lg:block">
      <span aria-hidden="true" className="ink-rule-soft block" />
      <Marginalia as="p" className="mt-4 leading-[1.9]">
        Set quarterly.
        <br />
        Filed by hand.
        <br />
        No algorithm.
      </Marginalia>
    </div>
  </nav>
);
