import { render } from '@testing-library/react';

import { GoalAverageHint } from '@/modules/finance/presentation/ui/components/goal-average-hint';
import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

describe('GoalAverageHint', () => {
  it('should show the average as a reference for the goal', () => {
    const { container } = render(<GoalAverageHint average={1500} />);

    // formatMoney uses a non-breaking space, which getByText would normalize.
    expect(container.textContent).toBe(`Média dos últimos 3 meses: ${formatMoney(1500)}`);
  });

  // Only a profit average can be negative; read as a goal suggestion it made
  // no sense, since a goal must be above zero.
  it('should explain a negative average instead of presenting it as a reference', () => {
    const { container } = render(
      <GoalAverageHint average={-300} label='Média por mês no período' />,
    );

    expect(container.textContent).toBe(
      `Média por mês no período ficou negativa (${formatMoney(-300)}).`,
    );
  });

  it('should stay hidden without history', () => {
    const { container } = render(<GoalAverageHint average={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
