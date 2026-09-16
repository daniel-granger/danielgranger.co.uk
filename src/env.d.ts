interface PlausibleFunction {
  (...args: unknown[]): void;
  q?: unknown[];
  o?: unknown;
  init?: (options?: unknown) => void;
}

interface Window {
  plausible?: PlausibleFunction;
}
