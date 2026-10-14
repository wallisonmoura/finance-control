import {
  getIncomeGoalHistoryHref,
  getIncomeGoalLaunchesHref,
} from '@/modules/reports/presentation/ui/utils/income-goal-history-links';

describe('income goal history links', () => {
  it('should point each measure to its page, with the period when given', () => {
    expect(getIncomeGoalHistoryHref('revenue')).toBe('/relatorios/metas/faturamento');
    expect(getIncomeGoalHistoryHref('profit', 12)).toBe('/relatorios/metas/lucro?months=12');
  });

  it('should filter the launches by income for revenue only', () => {
    expect(
      getIncomeGoalLaunchesHref({ measure: 'revenue', startDate: '2026-05-01', endDate: '2026-10-31' }),
    ).toBe('/finance/history?startDate=2026-05-01&endDate=2026-10-31&type=INCOME');
    expect(
      getIncomeGoalLaunchesHref({ measure: 'profit', startDate: '2026-05-01', endDate: '2026-10-31' }),
    ).toBe('/finance/history?startDate=2026-05-01&endDate=2026-10-31');
  });
});
