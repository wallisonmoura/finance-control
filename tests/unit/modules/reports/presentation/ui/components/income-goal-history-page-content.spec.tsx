import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';
import { MonthlySummaryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { IncomeGoalHistoryPageContent } from '@/modules/reports/presentation/ui/components/income-goal-history-page-content';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: () => '2026-10-10',
}));
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));

const rangeMock = jest.mocked(financeApiService.getMonthlySummaryRange);
const setIncomeGoalsMock = jest.mocked(financeApiService.setIncomeGoals);

function summaries(values: Array<[number, number]>): MonthlySummaryUi[] {
  return values.map(([income, expense], index) => {
    const date = new Date(Date.UTC(2026, 9 - (values.length - 1) + index, 1));
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      totalIncome: income,
      totalExpense: expense,
      result: income - expense,
    };
  });
}

const SIX = summaries([[5000, 2500], [6200, 4000], [4457.01, 5355.23], [0, 0], [4317.79, 4327.15], [1000, 200]]);

function renderPage(props: Partial<Parameters<typeof IncomeGoalHistoryPageContent>[0]> = {}) {
  return render(
    <IncomeGoalHistoryPageContent
      measure='profit'
      initialMonths={6}
      initialTargets={{ revenueTarget: 6000, profitTarget: 2200 }}
      targetsError={null}
      {...props}
    />,
  );
}

describe('IncomeGoalHistoryPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    rangeMock.mockResolvedValue({ data: SIX });
  });

  it('should show the title, the goal, the summary and the counts', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Lucro' })).toBeInTheDocument();
    // The sr-only chart description repeats the goal: query the visible line.
    expect(screen.getByText(/^Meta:/, { selector: 'p' })).toHaveTextContent('2.200,00');
    expect(screen.getByText('Média por mês')).toBeInTheDocument();
    expect(screen.getByText('R$ 758,48')).toBeInTheDocument();
    expect(screen.getByText('mai/26 · R$ 2.500,00')).toBeInTheDocument();
    expect(screen.getByText(/Bateu a meta em/, { selector: 'p' })).toHaveTextContent('Bateu a meta em 2 de 5 meses fechados.');
    expect(screen.getByText(/Fechou no vermelho em/, { selector: 'p' })).toHaveTextContent('Fechou no vermelho em 2 de 5 meses fechados.');
    expect(screen.getByRole('link', { name: /Ver lançamentos/ })).toHaveAttribute(
      'href',
      '/finance/history?startDate=2026-05-01&endDate=2026-10-31',
    );
  });

  it('should filter the launches by income on the revenue page and hide the red count', async () => {
    renderPage({ measure: 'revenue' });

    expect(await screen.findByRole('link', { name: /Ver lançamentos/ })).toHaveAttribute(
      'href',
      '/finance/history?startDate=2026-05-01&endDate=2026-10-31&type=INCOME',
    );
    expect(screen.queryByText(/Fechou no vermelho/)).not.toBeInTheDocument();
  });

  it('should work without a goal and invite to define one', async () => {
    renderPage({ initialTargets: { revenueTarget: 6000, profitTarget: null } });

    expect(await screen.findByText('Sem meta definida')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir meta' })).toBeInTheDocument();
    expect(screen.queryByText(/Bateu a meta em/, { selector: 'p' })).not.toBeInTheDocument();
  });

  it('should warn when the goal failed to load but still show the history', async () => {
    renderPage({ initialTargets: { revenueTarget: null, profitTarget: null }, targetsError: 'x' });

    expect(await screen.findByText('Não foi possível carregar a meta.')).toBeInTheDocument();
    expect(screen.getByText('Média por mês')).toBeInTheDocument();
  });

  it('should show an empty state when the period has no launches', async () => {
    rangeMock.mockResolvedValue({ data: summaries([[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]) });
    renderPage();

    expect(await screen.findByText('Nenhum lançamento nos últimos 6 meses.')).toBeInTheDocument();
  });

  it('should retry after a loading error', async () => {
    const user = userEvent.setup();
    rangeMock.mockResolvedValueOnce({ error: 'Falhou.' }).mockResolvedValueOnce({ data: SIX });
    renderPage();

    await user.click(await screen.findByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('Média por mês')).toBeInTheDocument();
  });

  it('should change the period and keep it in the URL', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Média por mês');

    await user.selectOptions(screen.getByLabelText('Período'), '12');

    expect(mockPush).toHaveBeenCalledWith('/relatorios/metas/lucro?months=12', { scroll: false });
    await waitFor(() => expect(rangeMock).toHaveBeenLastCalledWith(12));
  });

  it('should edit the goal on the page, keep the other one and recount without fetching', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000, profitTarget: 2400 } });
    renderPage();
    await screen.findByText('Média por mês');

    await user.click(screen.getByRole('button', { name: 'Editar meta' }));
    await user.clear(screen.getByLabelText('Lucro mensal'));
    await user.type(screen.getByLabelText('Lucro mensal'), '2400');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(setIncomeGoalsMock).toHaveBeenCalledWith({ revenueTarget: 6000, profitTarget: 2400 });
    // Only May (R$ 2.500) reaches R$ 2.400 now: recounted locally.
    expect(await screen.findByText(/Bateu a meta em/, { selector: 'p' })).toHaveTextContent('Bateu a meta em 1 de 5 meses fechados.');
    expect(screen.getByRole('button', { name: 'Editar meta' })).toHaveFocus();
    expect(rangeMock).toHaveBeenCalledTimes(1);
  });
});
