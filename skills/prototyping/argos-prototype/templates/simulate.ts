// Helpers for simulated services: realistic latency, deterministic outcomes.
// A prototype demo must be repeatable — the same input always yields the same result.

/** Stable 32-bit hash of a string (FNV-1a). */
export function hash(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Deterministic pseudo-random number in [0, 1) derived from a seed string. */
export function seeded(seed: string): number {
  return hash(seed) / 0x100000000;
}

/** Wait a latency in [minMs, maxMs], deterministic per seed so demos feel identical each run. */
export function latency(seed: string, minMs = 400, maxMs = 1200): Promise<void> {
  const ms = Math.round(minMs + seeded(seed) * (maxMs - minMs));
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pick an item from a list deterministically by seed. */
export function pick<T>(seed: string, items: readonly T[]): T {
  return items[hash(seed) % items.length];
}

/**
 * Wrap a simulated operation: waits a seeded latency, then runs `fn`.
 * Throw inside `fn` to simulate a failure path from the spec's error_handling.
 */
export async function simulate<T>(seed: string, fn: () => T, minMs?: number, maxMs?: number): Promise<T> {
  await latency(seed, minMs, maxMs);
  return fn();
}

/** Error carrying a user-facing message taken from the spec. */
export class SimulatedError extends Error {
  constructor(message: string, readonly code: string, readonly retryable = true) {
    super(message);
    this.name = "SimulatedError";
  }
}
