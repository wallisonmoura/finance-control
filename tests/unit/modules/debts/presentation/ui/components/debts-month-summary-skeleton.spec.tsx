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

  it('should let the label and value placeholders shrink to fit the 3-up tablet column instead of forcing horizontal overflow', () => {
    const { container } = render(<DebtsMonthSummarySkeleton />);

    const textContainers = container.querySelectorAll('.min-w-0.flex-1');
    expect(textContainers).toHaveLength(3);

    textContainers.forEach((textContainer) => {
      const bars = textContainer.querySelectorAll('[data-slot="skeleton"]');
      bars.forEach((bar) => {
        expect(bar).toHaveClass('w-full');
      });
    });
  });
});
