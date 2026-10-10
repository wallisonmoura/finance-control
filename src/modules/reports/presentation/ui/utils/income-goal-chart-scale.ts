const NICE_FACTORS = [1, 2, 2.5, 5, 10];
const TARGET_TICK_INTERVALS = 4;

// Smallest "round" step (1, 2, 2.5 or 5 × 10^k) that is at least `raw`.
function niceStep(raw: number): number {
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const factor = NICE_FACTORS.find((candidate) => candidate * magnitude >= raw) ?? 10;

  return factor * magnitude;
}

/**
 * Y axis for the income goal history chart: round ticks (no "R$ 611,96"),
 * always including zero, below-zero profit months and the goal line.
 */
export function getIncomeGoalChartScale(
  values: number[],
  target: number | null,
): { domain: [number, number]; ticks: number[] } {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values, target ?? 0);

  if (high === low) {
    return { domain: [0, 1], ticks: [0, 1] };
  }

  const step = niceStep((high - low) / TARGET_TICK_INTERVALS);
  const start = Math.floor(low / step) * step;
  const end = Math.ceil(high / step) * step;
  const ticks: number[] = [];

  for (let tick = start; tick <= end + step / 2; tick += step) {
    // Avoid floating-point drift (e.g. 0.30000000000000004) and "-0".
    ticks.push(Math.round(tick * 100) / 100 || 0);
  }

  return { domain: [start || 0, end], ticks };
}
