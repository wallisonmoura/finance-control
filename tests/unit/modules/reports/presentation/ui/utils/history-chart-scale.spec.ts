import { getHistoryChartScale } from '@/modules/reports/presentation/ui/utils/history-chart-scale';

describe('getHistoryChartScale', () => {
  it('should use round ticks that cover negative values and the goal', () => {
    // Real profit data: -898,22 in July and a R$ 2.000 goal.
    expect(getHistoryChartScale([743.31, -9.36, -898.22, 0], 2000)).toEqual({
      domain: [-1000, 2000],
      ticks: [-1000, 0, 1000, 2000],
    });
  });

  it('should start at zero when nothing is negative', () => {
    expect(getHistoryChartScale([4457.01, 5411.2, 4317.79], 6000)).toEqual({
      domain: [0, 6000],
      ticks: [0, 2000, 4000, 6000],
    });
  });

  it('should keep the goal inside the chart when every month is below it', () => {
    const { domain } = getHistoryChartScale([100, 200], 5000);
    expect(domain[1]).toBeGreaterThanOrEqual(5000);
  });

  it('should still draw an axis when every value is zero and there is no goal', () => {
    expect(getHistoryChartScale([0, 0], null)).toEqual({ domain: [0, 1], ticks: [0, 1] });
  });

  it('should always include zero as a tick', () => {
    const { ticks } = getHistoryChartScale([-350, 1234], null);
    expect(ticks).toContain(0);
  });
});
