import { render } from '@testing-library/react';

import { DebtsMonthSummarySkeleton } from '@/modules/debts/presentation/ui/components/debts-month-summary-skeleton';

describe('DebtsMonthSummarySkeleton', () => {
  it('should render 3 mini-summary cards, matching DebtsMonthSummary', () => {
    const { container } = render(<DebtsMonthSummarySkeleton />);

    expect(container.querySelectorAll('.rounded-xl.border')).toHaveLength(3);
  });

  it('should render an icon, a label and a value placeholder per card', () => {
    const { container } = render(<DebtsMonthSummarySkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(9);
  });
});
