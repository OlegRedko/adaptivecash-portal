import '@testing-library/jest-dom/vitest';

// jsdom implements neither of these, and Fluent UI uses them for overflow-aware
// components such as MessageBar. Without the stubs those components throw on render.
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

globalThis.ResizeObserver ??= ResizeObserverStub;
window.ResizeObserver ??= ResizeObserverStub;

globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;
