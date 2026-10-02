import { render, screen } from '@testing-library/react';

import { MonthlyInsightsCard } from '@/modules/finance/presentation/ui/components/monthly-insights-card';
import { MonthlyInsightsUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

const insights: MonthlyInsightsUi = {
  comparisonMonth: { year: 2026, month: 8 },
  referenceMonth: { year: 2026, month: 9 },
  isClosedMonth: false,
  hasEntries: true,
  expenseInsights: [
    { kind: 'TOP_EXPENSE_CATEGORY', categoryName: 'Alimentação', amount: 890, sharePercent: 35 },
  ],
  incomeInsights: [
    { kind: 'MONTH_RESULT', totalIncome: 4200, totalExpense: 3180, result: 1020 },
  ],
};

// Sentences are split into highlighted spans, so match the whole paragraph.
function getSentence(start: string) {
  return screen.getByText(
    (_, element) =>
      element?.tagName === 'P' && Boolean(element.textContent?.startsWith(start)),
  );
}

describe('MonthlyInsightsCard', () => {
  it('should render the heading and both columns', () => {
    render(<MonthlyInsightsCard insights={insights} />);

    expect(screen.getByRole('heading', { name: 'Insights do mês' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Gastos' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ganhos' })).toBeInTheDocument();
    expect(getSentence('Sua maior despesa é Alimentação')).toBeInTheDocument();
    expect(getSentence('Receitas − despesas até agora')).toBeInTheDocument();
  });

  it('should color good and bad values and make key values strong', () => {
    render(
      <MonthlyInsightsCard
        insights={{
          ...insights,
          incomeInsights: [
            { kind: 'MONTH_RESULT', totalIncome: 100, totalExpense: 109.36, result: -9.36 },
          ],
        }}
      />,
    );

    expect(screen.getByText('Alimentação')).toHaveClass('font-semibold');
    expect(screen.getByText(/^− R\$/)).toHaveClass('text-expense');
  });

  it('should render a single empty message when the month has no entries', () => {
    render(
      <MonthlyInsightsCard
        insights={{ ...insights, hasEntries: false, expenseInsights: [], incomeInsights: [] }}
      />,
    );

    expect(
      screen.getByText('Nenhum lançamento registrado neste mês ainda.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Gastos' })).not.toBeInTheDocument();
  });

  it('should keep the income column when the month has no expenses', () => {
    render(<MonthlyInsightsCard insights={{ ...insights, expenseInsights: [] }} />);

    expect(screen.getByText('Nenhuma despesa neste mês ainda.')).toBeInTheDocument();
    expect(getSentence('Receitas − despesas até agora')).toBeInTheDocument();
  });

  it('should render the error without breaking the heading', () => {
    render(<MonthlyInsightsCard error='Não foi possível carregar os insights.' />);

    expect(screen.getByRole('heading', { name: 'Insights do mês' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os insights.',
    );
  });

  it('should title the card with the closed month and explain why', () => {
    render(<MonthlyInsightsCard insights={{ ...insights, isClosedMonth: true }} />);

    expect(screen.getByRole('heading', { name: 'Insights de setembro' })).toBeInTheDocument();
    expect(screen.getByText('Outubro ainda não tem lançamentos.')).toBeInTheDocument();
  });

  it('should name the closed month in an empty column', () => {
    render(<MonthlyInsightsCard insights={{ ...insights, isClosedMonth: true, expenseInsights: [] }} />);

    expect(screen.getByText('Nenhuma despesa em setembro.')).toBeInTheDocument();
  });

  it('should link to the full reports', () => {
    render(<MonthlyInsightsCard insights={insights} />);

    expect(screen.getByRole('link', { name: 'Ver relatórios' })).toHaveAttribute(
      'href',
      '/relatorios',
    );
  });

  it('should color the dot with the insight sentiment', () => {
    const { container } = render(
      <MonthlyInsightsCard
        insights={{
          ...insights,
          expenseInsights: [],
          incomeInsights: [
            { kind: 'INCOME_TOTAL_COMPARISON', current: 4317.79, previous: 5411.2, changePercent: -20 },
          ],
        }}
      />,
    );

    expect(container.querySelector('[data-slot="insight-dot"]')).toHaveClass('bg-expense');
  });

  it('should not draw comparison bars', () => {
    const { container } = render(<MonthlyInsightsCard insights={insights} />);

    expect(container.querySelector('[data-slot="insight-bar-fill"]')).toBeNull();
  });
});
