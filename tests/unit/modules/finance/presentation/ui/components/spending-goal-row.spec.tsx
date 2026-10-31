import { render, screen } from '@testing-library/react';

import { SpendingGoalRow } from '@/modules/finance/presentation/ui/components/spending-goal-row';
import { SpendingGoalUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

function goal(overrides: Partial<SpendingGoalUi> = {}): SpendingGoalUi {
  return {
    categoryId: 'bebida',
    categoryName: 'Bebida alcoólica',
    limit: 300,
    spent: 100,
    usedPercent: 33,
    expectedSoFar: 150,
    monthElapsedPercent: 50,
    remaining: 200,
    overBy: 0,
    status: 'ON_TRACK',
    ...overrides,
  };
}

describe('SpendingGoalRow', () => {
  // The dot's color is hidden from screen readers; the status must also be
  // said in words, like the income goals do.
  it.each([
    ['EXCEEDED', 'Passou do limite'],
    ['ABOVE_PACE', 'Acima do ritmo'],
    ['ON_TRACK', 'No ritmo'],
  ] as const)('should state the %s status in words', (status, label) => {
    render(
      <ul>
        <SpendingGoalRow goal={goal({ status })} />
      </ul>,
    );

    expect(screen.getByText(`Situação: ${label}`)).toBeInTheDocument();
  });
});
