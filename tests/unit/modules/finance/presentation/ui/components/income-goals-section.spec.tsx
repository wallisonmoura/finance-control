import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncomeGoalsSection } from '@/modules/finance/presentation/ui/components/income-goals-section';
import { setIncomeGoals } from '@/modules/finance/presentation/ui/services/finance-api.service';
import {
  IncomeGoalProgressUi,
  IncomeGoalsOverviewUi,
} from '@/modules/finance/presentation/ui/types/finance-ui.types';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setIncomeGoals: jest.fn(),
}));

const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const setIncomeGoalsMock = jest.mocked(setIncomeGoals);

function progress(overrides: Partial<IncomeGoalProgressUi> = {}): IncomeGoalProgressUi {
  return {
    target: 6000,
    achieved: 2000,
    expectedSoFar: 3000,
    remaining: 4000,
    daysLeft: 16,
    perDay: 250,
    progressPercent: 33,
    exceededBy: 0,
    status: 'BEHIND',
    ...overrides,
  };
}

const both: IncomeGoalsOverviewUi = {
  revenue: progress(),
  profit: progress({
    target: 2000,
    achieved: 900,
    expectedSoFar: 1000,
    remaining: 1100,
    perDay: 68.75,
    progressPercent: 45,
    status: 'EARLY',
  }),
  averages: { revenue: 4000, profit: 1500 },
};

describe('IncomeGoalsSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should show both goals with their status in words', () => {
    render(<IncomeGoalsSection overview={both} />);

    expect(screen.getByRole('heading', { name: 'Metas de ganho' })).toBeInTheDocument();
    expect(screen.getByText('Faturamento')).toBeInTheDocument();
    expect(screen.getByText('Lucro')).toBeInTheDocument();
    expect(screen.getByText(/Abaixo do ritmo\. Faltam/)).toBeInTheDocument();
    expect(screen.getByText('Situação: Abaixo do ritmo')).toBeInTheDocument();
    expect(screen.getByText('Situação: Início do mês')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar metas de ganho' })).toBeInTheDocument();
  });

  it('should color the dot by status, neutral early in the month', () => {
    const { container } = render(<IncomeGoalsSection overview={both} />);
    const dots = container.querySelectorAll('[data-slot="income-goal-dot"]');

    expect(dots[0]).toHaveClass('bg-warning');
    expect(dots[1]).toHaveClass('bg-muted-foreground');
  });

  it('should only show the goals that were set', () => {
    render(<IncomeGoalsSection overview={{ ...both, profit: null }} />);

    expect(screen.getByText('Faturamento')).toBeInTheDocument();
    expect(screen.queryByText('Lucro')).not.toBeInTheDocument();
  });

  it('should invite to define goals when there are none', () => {
    render(<IncomeGoalsSection overview={{ ...both, revenue: null, profit: null }} />);

    expect(
      screen.getByText('Defina quanto quer faturar e lucrar por mês.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Definir metas de ganho' })).toBeInTheDocument();
  });

  it('should show a loading error', () => {
    render(<IncomeGoalsSection error='Não foi possível carregar as metas de ganho.' />);

    expect(
      screen.getByText('Não foi possível carregar as metas de ganho.'),
    ).toBeInTheDocument();
  });

  it('should edit the goals, clearing one, and refresh the page', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000, profitTarget: null } });
    render(<IncomeGoalsSection overview={both} />);

    await user.click(screen.getByRole('button', { name: 'Editar metas de ganho' }));
    expect(screen.getByLabelText('Faturamento mensal')).toHaveValue('6000');
    await user.clear(screen.getByLabelText('Lucro mensal'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(setIncomeGoalsMock).toHaveBeenCalledWith({ revenueTarget: 6000, profitTarget: null }),
    );
    expect(mockRefresh).toHaveBeenCalled();
    expect(screen.queryByLabelText('Faturamento mensal')).not.toBeInTheDocument();
  });
});
