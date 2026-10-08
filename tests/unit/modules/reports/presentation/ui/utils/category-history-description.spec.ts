import { describeCategoryHistoryChart } from '@/modules/reports/presentation/ui/utils/category-history-description';
import { buildCategoryHistory } from '@/modules/reports/presentation/ui/utils/category-history';

function months() {
  return buildCategoryHistory({
    entries: [],
    monthKeys: ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'],
    currentMonthKey: '2026-10',
    monthlyLimit: null,
  }).months;
}

describe('describeCategoryHistoryChart', () => {
  it('should describe the chart range and the goal for screen readers', () => {
    expect(describeCategoryHistoryChart('Combustível', months(), 1500)).toMatch(
      /^Gráfico de barras do gasto mensal de Combustível, de mai\/26 a out\/26\. Meta de R\$\s1\.500,00 por mês\.$/,
    );
  });

  it('should say when there is no goal', () => {
    expect(describeCategoryHistoryChart('Combustível', months(), null)).toBe(
      'Gráfico de barras do gasto mensal de Combustível, de mai/26 a out/26. Sem meta definida.',
    );
  });
});
