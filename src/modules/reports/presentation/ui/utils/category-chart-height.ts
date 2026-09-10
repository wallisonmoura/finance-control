const MIN_CHART_HEIGHT = 288;
const ROW_HEIGHT = 26;
const BASE_PADDING = 64;

export function getCategoryChartHeight(categoryCount: number): number {
  return Math.max(MIN_CHART_HEIGHT, categoryCount * ROW_HEIGHT + BASE_PADDING);
}
