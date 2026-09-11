import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

/** True when the visitor has asked for less motion (§11). */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return reduced;
};

export interface RevealOptions {
  /** How far inside the viewport the element must be before it fires (§10: 80px). */
  thresholdPx?: number;
}

/**
 * Reveal on scroll — `opacity 0→1, translateY 14px→0`, 700ms on the press curve,
 * 80px viewport threshold, once (§10). Children stagger with `--d` on `.reveal`.
 *
 * Returns a ref to attach to the section and a `revealClass(i)` helper that tags
 * each element for its own staggered transition.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  thresholdPx = 80,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined' || prefersReducedMotion()) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: `0px 0px -${thresholdPx}px 0px`, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [thresholdPx]);

  /** Class for a reveal container; `step` staggers rows by 60ms (§10). */
  const revealClass = (step = 0, base = '') =>
    [base, 'reveal', revealed ? 'is-in' : ''].filter(Boolean).join(' ');

  const revealStyle = (step = 0): CSSProperties =>
    ({ ['--d' as string]: `${step * 60}ms` }) as CSSProperties;

  return { ref, revealed, revealClass, revealStyle } as const;
}
