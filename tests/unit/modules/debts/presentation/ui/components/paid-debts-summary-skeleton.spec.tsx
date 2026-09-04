import { render } from '@testing-library/react';

import { PaidDebtsSummarySkeleton } from '@/modules/debts/presentation/ui/components/paid-debts-summary-skeleton';

describe('PaidDebtsSummarySkeleton', () => {
  it('should render a single card divided into 3 columns, matching the real summary bar', () => {
    const { container } = render(<PaidDebtsSummarySkeleton />);

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(1);
  });

  it('should render an icon, a label and a value placeholder per column', () => {
    const { container } = render(<PaidDebtsSummarySkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(9);
  });
});
