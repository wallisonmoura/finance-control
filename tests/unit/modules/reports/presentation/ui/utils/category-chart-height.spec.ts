import { getCategoryChartHeight } from '@/modules/reports/presentation/ui/utils/category-chart-height';

describe('getCategoryChartHeight', () => {
  it('should return the minimum chart height when there are few categories', () => {
    expect(getCategoryChartHeight(3)).toBe(288);
    expect(getCategoryChartHeight(8)).toBe(288);
  });

  it('should grow the chart height as the category count increases, so bars never get cramped', () => {
    const heightFor10 = getCategoryChartHeight(10);
    const heightFor26 = getCategoryChartHeight(26);

    expect(heightFor26).toBeGreaterThan(heightFor10);
  });

  it('should reserve at least 26px per category so labels never overlap', () => {
    const categoryCount = 26;

    expect(getCategoryChartHeight(categoryCount)).toBeGreaterThanOrEqual(
      categoryCount * 26,
    );
  });
});
