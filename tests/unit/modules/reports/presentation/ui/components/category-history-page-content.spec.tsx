import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { setCategoryMonthlyLimit } from '@/modules/finance/presentation/ui/services/finance-api.service';
import { CategoryHistoryPageContent } from '@/modules/reports/presentation/ui/components/category-history-page-content';
import {
  useCategoryHistory,
  UseCategoryHistoryResult,
} from '@/modules/reports/presentation/ui/hooks/use-category-history';
import { buildCategoryHistory } from '@/modules/reports/presentation/ui/utils/category-history';

jest.mock('@/modules/reports/presentation/ui/hooks/use-category-history');
jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setCategoryMonthlyLimit: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const useCategoryHistoryMock = jest.mocked(useCategoryHistory);
const setCategoryMonthlyLimitMock = jest.mocked(setCategoryMonthlyLimit);

const monthKeys = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];

function history(monthlyLimit: number | null, entries = [
  { date: '2026-05-10', amount: 1600 },
  { date: '2026-06-10', amount: 800 },
  { date: '2026-08-10', amount: 1700 },
  { date: '2026-10-02', amount: 100 },
]) {
  return buildCategoryHistory({ entries, monthKeys, currentMonthKey: '2026-10', monthlyLimit });
}

function mockHook(overrides: Partial<UseCategoryHistoryResult> = {}) {
  const result: UseCategoryHistoryResult = {
    category: { id: 'cat-1', name: 'Combustível', monthlyLimit: 1500 },
    history: history(1500),
    range: { startDate: '2026-05-01', endDate: '2026-10-31' },
    isLoading: false,
    notFound: false,
    error: null,
    refresh: jest.fn(),
    setLimit: jest.fn(),
    ...overrides,
  };
  useCategoryHistoryMock.mockReturnValue(result);
  return result;
}

describe('CategoryHistoryPageContent', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show the goal, the period summary and the overrun sentence', () => {
    mockHook();

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(screen.getByRole('heading', { name: 'Combustível' })).toBeInTheDocument();
    expect(screen.getByText(/Meta:/)).toHaveTextContent(/Meta: R\$\s1\.500,00 por mês/);
    expect(screen.getByRole('button', { name: 'Editar meta' })).toBeInTheDocument();
    expect(screen.getByText('Média por mês').parentElement).toHaveTextContent(/R\$\s820,00/);
    expect(screen.getByText('Maior mês').parentElement).toHaveTextContent(/ago\/26.*R\$\s1\.700,00/);
    expect(screen.getByText('Total no período').parentElement).toHaveTextContent(/R\$\s4\.200,00/);
    expect(screen.getByText(/Passou do limite atual/)).toHaveTextContent(
      'Passou do limite atual em 2 de 5 meses fechados.',
    );
  });

  it('should describe the chart and offer its data as a table', () => {
    mockHook();

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(
      screen.getByText(/Gráfico de barras do gasto mensal de Combustível/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver dados em tabela' })).toBeInTheDocument();
  });

  it('should link back to reports and to the filtered launches', () => {
    mockHook();

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(screen.getByRole('link', { name: /Voltar para relatórios/ })).toHaveAttribute(
      'href',
      '/relatorios?months=6',
    );
    expect(screen.getByRole('link', { name: /Ver lançamentos/ })).toHaveAttribute(
      'href',
      '/finance/history?startDate=2026-05-01&endDate=2026-10-31&type=EXPENSE&categoryId=cat-1',
    );
  });

  it('should invite to define a goal when the category has none', () => {
    mockHook({
      category: { id: 'cat-1', name: 'Combustível', monthlyLimit: null },
      history: history(null),
    });

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(screen.getByText('Sem meta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir meta' })).toBeInTheDocument();
    expect(screen.queryByText(/Passou do limite atual/)).not.toBeInTheDocument();
  });

  it('should define a goal in place and recalculate without reloading', async () => {
    const user = userEvent.setup();
    const { setLimit } = mockHook({
      category: { id: 'cat-1', name: 'Combustível', monthlyLimit: null },
      history: history(null),
    });
    setCategoryMonthlyLimitMock.mockResolvedValue({
      data: { id: 'cat-1', name: 'Combustível', slug: 'combustivel', monthlyLimit: 1200 },
    });

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    await user.click(screen.getByRole('button', { name: 'Definir meta' }));
    await user.type(screen.getByLabelText('Limite mensal de Combustível'), '1200');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(setLimit).toHaveBeenCalledWith(1200));
    expect(setCategoryMonthlyLimitMock).toHaveBeenCalledWith('cat-1', 1200);
    expect(screen.queryByLabelText('Limite mensal de Combustível')).not.toBeInTheDocument();
  });

  it('should describe the goal hint average as the selected period', async () => {
    const user = userEvent.setup();
    mockHook();

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    await user.click(screen.getByRole('button', { name: 'Editar meta' }));

    expect(screen.getByText(/Média por mês no período/)).toHaveTextContent(/R\$\s820,00/);
    expect(screen.queryByText(/últimos 3 meses/)).not.toBeInTheDocument();
  });

  it('should change the period through the URL', async () => {
    const user = userEvent.setup();
    mockHook();

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    await user.selectOptions(screen.getByLabelText('Período'), '12');

    expect(mockPush).toHaveBeenCalledWith('/relatorios/categorias/cat-1?months=12', {
      scroll: false,
    });
  });

  it('should show an empty message when nothing was spent in the period', () => {
    mockHook({ history: history(1500, []) });

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(
      screen.getByText('Nenhum gasto em Combustível nos últimos 6 meses.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Média por mês')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Ver lançamentos/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar meta' })).toBeInTheDocument();
  });

  it('should tell when the category is not found', () => {
    mockHook({ category: null, history: null, notFound: true });

    render(<CategoryHistoryPageContent categoryId='nope' initialMonths={6} />);

    expect(screen.getByText('Categoria não encontrada.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voltar para relatórios/ })).toBeInTheDocument();
  });

  it('should offer a retry when loading failed', async () => {
    const user = userEvent.setup();
    const { refresh } = mockHook({ category: null, history: null, error: 'Falha ao buscar' });

    render(<CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />);

    expect(screen.getByText('Falha ao buscar')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(refresh).toHaveBeenCalled();
  });

  it('should show the skeleton while loading', () => {
    mockHook({ category: null, history: null, isLoading: true });

    const { container } = render(
      <CategoryHistoryPageContent categoryId='cat-1' initialMonths={6} />,
    );

    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });
});
