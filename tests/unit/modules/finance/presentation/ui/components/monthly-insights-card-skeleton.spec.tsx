import { render, screen } from '@testing-library/react';

import { MonthlyInsightsCardSkeleton } from '@/modules/finance/presentation/ui/components/monthly-insights-card-skeleton';

describe('MonthlyInsightsCardSkeleton', () => {
  it('should render the static heading and two columns of placeholder rows', () => {
    const { container } = render(<MonthlyInsightsCardSkeleton />);

    expect(screen.getByRole('heading', { name: 'Insights do mês' })).toBeInTheDocument();
    // 2 columns × (1 title + 3 rows × (dot + line))
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(14);
  });
});
