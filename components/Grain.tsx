import React from 'react';

/**
 * SVG grain overlay.
 *
 * A procedural fractal-noise field laid over the whole page at 0.04 opacity,
 * the way newsprint holds a faint tooth. Decorative only: `aria-hidden` and
 * never in the pointer path. The filter is generated at render time, so there
 * is no image asset to ship.
 */
export const Grain: React.FC = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    className="pointer-events-none fixed inset-0 z-[60] h-full w-full opacity-[0.04]"
    style={{ mixBlendMode: 'multiply' }}
    preserveAspectRatio="none"
  >
    <filter id="cabinet-grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves={3} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#cabinet-grain)" />
  </svg>
);
