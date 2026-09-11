import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

/**
 * jsdom does not implement IntersectionObserver or scrolling. The journal uses
 * the observer to track which department you are reading, and scrollIntoView to
 * jump between them — both are stubbed so the real components can mount.
 */
class IntersectionObserverStub {
  root = null;
  rootMargin = '';
  thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

(globalThis as any).IntersectionObserver = IntersectionObserverStub;

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.scrollTo = vi.fn() as any;
  Element.prototype.scrollIntoView = vi.fn() as any;
  window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as any;
});

afterEach(() => {
  cleanup();
});
