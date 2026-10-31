import { render } from '@testing-library/react';

import { ReportsOverviewSkeleton } from '@/modules/reports/presentation/ui/components/reports-overview-skeleton';

describe('ReportsOverviewSkeleton', () => {
  // Mirrors ReportsPageContent: Receita × despesa full width on top, then
  // Gastos por categoria and Dívidas pagas side by side.
  it('should put the full-width chart first, like the real page', () => {
    const { container } = render(<ReportsOverviewSkeleton />);
    const grid = container.querySelector('[data-slot="reports-charts-grid"]');

    expect(grid?.children).toHaveLength(3);
    expect(grid?.children[0]).toHaveClass('xl:col-span-2');
    expect(grid?.children[1]).not.toHaveClass('xl:col-span-2');
    expect(grid?.children[2]).not.toHaveClass('xl:col-span-2');
  });
});
