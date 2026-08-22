/**
 * Rounds a monetary value to the nearest cent, fixing the binary
 * floating-point drift that repeated decimal addition/subtraction produces
 * in JS (e.g. `0.1 + 0.2 === 0.30000000000000004`). Apply this to the final
 * result of a sum/reduce over monetary amounts, not to each intermediate
 * value.
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}
