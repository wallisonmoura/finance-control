import { render, screen } from '@testing-library/react';

import { SpendingGoalsCard } from '@/modules/finance/presentation/ui/components/spending-goals-card';
import {
  SpendingGoalsOverviewUi,
  SpendingGoalUi,
} from '@/modules/finance/presentation/ui/types/finance-ui.types';

function goal(
  name: string,
  status: SpendingGoalUi['status'],
  usedPercent: number,
): SpendingGoalUi {
  return {
    categoryId: name,
    categoryName: name,
    limit: 100,
    spent: usedPercent,
    usedPercent,
    expectedSoFar: 50,
    projected: 120,
    remaining: Math.max(100 - usedPercent, 0),
    overBy: Math.max(usedPercent - 100, 0),
    status,
  };
}

function overview(goals: SpendingGoalUi[]): SpendingGoalsOverviewUi {
  return { goals, availableCategories: [], averageByCategoryId: {} };
}

describe('SpendingGoalsCard', () => {
  it('should show at most the three most critical goals and link to all goals', () => {
    render(
      <SpendingGoalsCard
        overview={overview([
          goal('Bebida', 'EXCEEDED', 126),
          goal('Lazer', 'ABOVE_PACE', 60),
          goal('Combustível', 'ON_TRACK', 40),
          goal('Pet', 'ON_TRACK', 10),
        ])}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Metas do mês' })).toBeInTheDocument();
    expect(screen.getByText('Bebida')).toBeInTheDocument();
    expect(screen.getByText('Combustível')).toBeInTheDocument();
    expect(screen.queryByText('Pet')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver todas as metas' })).toHaveAttribute(
      'href',
      '/metas',
    );
  });

  it('should describe each goal with its usage and status sentence', () => {
    render(<SpendingGoalsCard overview={overview([goal('Bebida', 'EXCEEDED', 126)])} />);

    expect(screen.getByText(/de R\$\s100,00 \(126%\)/)).toBeInTheDocument();
    expect(screen.getByText(/Passou/)).toHaveTextContent(/Passou R\$\s26,00 da meta\./);
  });

  it('should invite to create goals when there are none', () => {
    render(<SpendingGoalsCard overview={overview([])} />);

    expect(
      screen.getByText('Defina metas pra segurar seus gastos.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Criar metas' })).toHaveAttribute(
      'href',
      '/metas',
    );
    expect(
      screen.queryByRole('link', { name: 'Ver todas as metas' }),
    ).not.toBeInTheDocument();
  });

  it('should show the error only in the card', () => {
    render(<SpendingGoalsCard error='Não foi possível carregar as metas.' />);

    expect(screen.getByRole('heading', { name: 'Metas do mês' })).toBeInTheDocument();
    expect(screen.getByText('Não foi possível carregar as metas.')).toBeInTheDocument();
  });

  it.each([
    ['EXCEEDED', 'bg-expense'],
    ['ABOVE_PACE', 'bg-warning'],
    ['ON_TRACK', 'bg-income'],
  ] as const)('should color the %s dot with %s', (status, className) => {
    const { container } = render(
      <SpendingGoalsCard overview={overview([goal('Bebida', status, 60)])} />,
    );

    expect(container.querySelector('[data-slot="goal-dot"]')).toHaveClass(className);
  });
});
