/**
 * Anchor travel for the interactive bits (search, genre chips in the colophon).
 * The page is assembled from real `href="#…"` links, so programmatic scrolling is
 * an enhancement: it is skipped where `scrollIntoView` does not exist, and the
 * anchor still works on its own.
 */
export const scrollToId = (id: string) => {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(id);
  if (!el || typeof el.scrollIntoView !== 'function') return;

  const reduced =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
};
