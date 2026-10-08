import {
  getCategoryHistoryHref,
  getCategoryLaunchesHref,
} from '@/modules/reports/presentation/ui/utils/category-history-links';

describe('category history links', () => {
  it('should link to the category history keeping the period', () => {
    expect(getCategoryHistoryHref('cat-1', 12)).toBe(
      '/relatorios/categorias/cat-1?months=12',
    );
  });

  it('should link to the expense history filtered by category and period', () => {
    expect(
      getCategoryLaunchesHref({
        categoryId: 'cat-1',
        startDate: '2026-05-01',
        endDate: '2026-10-31',
      }),
    ).toBe(
      '/finance/history?startDate=2026-05-01&endDate=2026-10-31&type=EXPENSE&categoryId=cat-1',
    );
  });
});
