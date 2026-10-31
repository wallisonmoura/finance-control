import React from 'react';
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
  afterEach(() => jest.restoreAllMocks());

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

  it('should show a loading error with a retry', async () => {
    const user = userEvent.setup();
    render(<IncomeGoalsSection error='Não foi possível carregar as metas de ganho.' />);

    expect(
      screen.getByText('Não foi possível carregar as metas de ganho.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(mockRefresh).toHaveBeenCalled();
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

  it('should give the focus back to the edit button after cancelling', async () => {
    const user = userEvent.setup();
    render(<IncomeGoalsSection overview={both} />);

    await user.click(screen.getByRole('button', { name: 'Editar metas de ganho' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.getByRole('button', { name: 'Editar metas de ganho' })).toHaveFocus();
  });

  it('should give the focus back to the edit button after saving', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000, profitTarget: 2000 } });
    render(<IncomeGoalsSection overview={both} />);

    await user.click(screen.getByRole('button', { name: 'Editar metas de ganho' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Editar metas de ganho' })).toHaveFocus(),
    );
  });

  it('should link each goal name to its history', () => {
    render(<IncomeGoalsSection overview={both} />);

    expect(screen.getByRole('link', { name: 'Faturamento' })).toHaveAttribute(
      'href',
      '/relatorios/metas/faturamento',
    );
    expect(screen.getByRole('link', { name: 'Lucro' })).toHaveAttribute(
      'href',
      '/relatorios/metas/lucro',
    );
  });

  it('should put the amount per day on its own line and say profit above the goal is room to spend', () => {
    render(
      <IncomeGoalsSection
        overview={{
          ...both,
          profit: progress({
            target: 2000,
            achieved: 2600,
            remaining: 0,
            progressPercent: 130,
            exceededBy: 600,
            status: 'REACHED',
          }),
        }}
      />,
    );

    expect(screen.getByText(/^Cerca de/)).toBeInTheDocument();
    expect(screen.getByText('Situação: Acima da meta')).toBeInTheDocument();
    expect(screen.getByText(/^Você ainda pode gastar/)).toBeInTheDocument();
  });
  // router.refresh() runs inside a transition: while it is pending the rows
  // would still show the values from before the save.
  it('should show the rows as loading instead of the old values while the page refreshes', () => {
    jest.spyOn(React, 'useTransition').mockReturnValue([true, jest.fn()]);

    render(<IncomeGoalsSection overview={both} />);

    expect(screen.getByTestId('income-goals-body')).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('Faturamento')).not.toBeInTheDocument();
    expect(screen.queryByText(/Abaixo do ritmo/)).not.toBeInTheDocument();
  });

  it('should refresh the page inside a transition after saving', async () => {
    const startTransition = jest.fn((callback: () => void) => callback());
    jest.spyOn(React, 'useTransition').mockReturnValue([false, startTransition]);
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000, profitTarget: 2000 } });
    render(<IncomeGoalsSection overview={both} />);

    await user.click(screen.getByRole('button', { name: 'Editar metas de ganho' }));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(startTransition).toHaveBeenCalled());
    expect(mockRefresh).toHaveBeenCalled();
  });
});
