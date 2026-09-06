import { render } from '@testing-library/react';

import { ReportsChartSkeleton } from '@/modules/reports/presentation/ui/components/reports-chart-skeleton';

describe('ReportsChartSkeleton', () => {
  it('should render a title placeholder and a chart-area placeholder, matching a real chart card', () => {
    const { container } = render(<ReportsChartSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2);
  });

  it('should render inside a card, matching the real chart wrapper', () => {
    const { container } = render(<ReportsChartSkeleton />);

    expect(
      container.querySelector('.border.border-border.bg-card'),
    ).toBeInTheDocument();
  });
});
