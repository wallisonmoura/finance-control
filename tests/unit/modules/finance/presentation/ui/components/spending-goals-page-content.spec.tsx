import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SpendingGoalsPageContent } from '@/modules/finance/presentation/ui/components/spending-goals-page-content';
import { setCategoryMonthlyLimit } from '@/modules/finance/presentation/ui/services/finance-api.service';
import { SpendingGoalsOverviewUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setCategoryMonthlyLimit: jest.fn(),
}));

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const setCategoryMonthlyLimitMock = jest.mocked(setCategoryMonthlyLimit);

const overview: SpendingGoalsOverviewUi = {
  goals: [
    {
      categoryId: 'bebida',
      categoryName: 'Bebida alcoólica',
      limit: 300,
      spent: 376.69,
      usedPercent: 126,
      expectedSoFar: 150,
      monthElapsedPercent: 23,
      remaining: 0,
      overBy: 76.69,
      status: 'EXCEEDED',
    },
  ],
  availableCategories: [
    { id: 'combustivel', name: 'Combustível', averageSpent: 1712.4 },
    { id: 'pet', name: 'Pet', averageSpent: null },
  ],
  averageByCategoryId: { bebida: 340, combustivel: 1712.4, pet: null },
};

function category(id: string, monthlyLimit: number | null) {
  return { data: { id, name: id, slug: id, monthlyLimit } };
}

describe('SpendingGoalsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list the goals with their status', () => {
    render(<SpendingGoalsPageContent overview={overview} />);

    expect(screen.getByRole('heading', { name: 'Metas de gasto' })).toBeInTheDocument();
    expect(screen.getByText('Bebida alcoólica')).toBeInTheDocument();
    expect(screen.getByText(/Passou/)).toHaveTextContent(/Passou R\$\s76,69 da meta\./);
  });

  it('should create a goal showing the average hint of the chosen category', async () => {
    const user = userEvent.setup();
    setCategoryMonthlyLimitMock.mockResolvedValue(category('combustivel', 1500));
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(screen.getByRole('button', { name: 'Nova meta' }));
    const categorySelect = screen.getByLabelText('Categoria');
    expect(within(categorySelect).queryByRole('option', { name: 'Bebida alcoólica' })).toBeNull();

    await user.selectOptions(categorySelect, 'combustivel');
    expect(screen.getByText(/média dos últimos 3 meses/i)).toHaveTextContent(/1\.712,40/);

    await user.type(screen.getByLabelText('Limite mensal'), '1500,50');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(setCategoryMonthlyLimitMock).toHaveBeenCalledWith('combustivel', 1500.5),
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should hide the average hint when the category had no spending', async () => {
    const user = userEvent.setup();
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(screen.getByRole('button', { name: 'Nova meta' }));
    await user.selectOptions(screen.getByLabelText('Categoria'), 'pet');

    expect(screen.queryByText(/média dos últimos 3 meses/i)).not.toBeInTheDocument();
  });

  it('should require a category and a positive limit before saving', async () => {
    const user = userEvent.setup();
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(screen.getByRole('button', { name: 'Nova meta' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Selecione uma categoria.')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Categoria'), 'pet');
    await user.type(screen.getByLabelText('Limite mensal'), '0');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Informe um limite maior que zero.')).toBeInTheDocument();

    expect(setCategoryMonthlyLimitMock).not.toHaveBeenCalled();
  });

  it('should show the API error and keep the form open', async () => {
    const user = userEvent.setup();
    setCategoryMonthlyLimitMock.mockResolvedValue({
      error: 'Valor excede o limite permitido.',
    });
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(screen.getByRole('button', { name: 'Nova meta' }));
    await user.selectOptions(screen.getByLabelText('Categoria'), 'pet');
    await user.type(screen.getByLabelText('Limite mensal'), '50');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Valor excede o limite permitido.')).toBeInTheDocument();
    expect(screen.getByLabelText('Limite mensal')).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should close the new goal form on cancel', async () => {
    const user = userEvent.setup();
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(screen.getByRole('button', { name: 'Nova meta' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByLabelText('Categoria')).not.toBeInTheDocument();
  });

  it('should edit a goal inline', async () => {
    const user = userEvent.setup();
    setCategoryMonthlyLimitMock.mockResolvedValue(category('bebida', 400));
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(
      screen.getByRole('button', { name: 'Editar meta de Bebida alcoólica' }),
    );
    const input = screen.getByLabelText('Novo limite de Bebida alcoólica');
    expect(input).toHaveValue('300');
    expect(screen.getByText(/média dos últimos 3 meses/i)).toHaveTextContent(/340,00/);

    await user.clear(input);
    await user.type(input, '400');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(setCategoryMonthlyLimitMock).toHaveBeenCalledWith('bebida', 400),
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should remove a goal after confirmation', async () => {
    const user = userEvent.setup();
    setCategoryMonthlyLimitMock.mockResolvedValue(category('bebida', null));
    render(<SpendingGoalsPageContent overview={overview} />);

    await user.click(
      screen.getByRole('button', { name: 'Remover meta de Bebida alcoólica' }),
    );
    expect(setCategoryMonthlyLimitMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Remover' }));

    await waitFor(() =>
      expect(setCategoryMonthlyLimitMock).toHaveBeenCalledWith('bebida', null),
    );
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should explain the idea when there are no goals', () => {
    render(<SpendingGoalsPageContent overview={{ ...overview, goals: [] }} />);

    expect(
      screen.getByText(/Escolha as categorias que você quer segurar/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nova meta' })).toBeInTheDocument();
  });

  it('should hide the new goal button when every category already has a goal', () => {
    render(
      <SpendingGoalsPageContent overview={{ ...overview, availableCategories: [] }} />,
    );

    expect(screen.queryByRole('button', { name: 'Nova meta' })).not.toBeInTheDocument();
  });

  it('should offer a retry when loading failed', async () => {
    const user = userEvent.setup();
    render(<SpendingGoalsPageContent error='Não foi possível carregar as metas.' />);

    expect(screen.getByText('Não foi possível carregar as metas.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mockRefresh).toHaveBeenCalled();
  });
});
