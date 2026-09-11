import React from 'react';

/**
 * §7.7 Tuning ticker — a CSS marquee of titles separated by `·`, mono, low ink,
 * with a single accent “LIVE” tag. Pauses on hover, and whenever focus is inside
 * it (§11). Decorative repetition, so `aria-hidden`: the static equivalent of
 * everything it scrolls is the Tonight grid below.
 */
const Ticker: React.FC<{ items: string[] }> = ({ items }) => {
  const set = (key: number) => (
    <div className="ticker__set" key={key}>
      {items.map((item, i) => (
        <span className="ticker__item" key={`${key}-${i}`}>
          {i === 1 && key === 0 ? (
            <span className="ticker__live">
              <span className="onair__dot" aria-hidden="true" />
              Live
            </span>
          ) : null}
          {item}
          <span className="ticker__sep" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {/* four copies so the −50% loop is seamless even on an ultrawide monitor */}
        {set(0)}
        {set(1)}
        {set(2)}
        {set(3)}
      </div>
    </div>
  );
};

export default Ticker;
