import { render } from '@testing-library/react';

import { IncomeGoalHistorySkeleton } from '@/modules/reports/presentation/ui/components/income-goal-history-skeleton';

describe('IncomeGoalHistorySkeleton', () => {
  it('should mirror the page: back link, title, period, goal line, chart and summary', () => {
    const { container } = render(<IncomeGoalHistorySkeleton />);

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThanOrEqual(9);
    expect(container.querySelector('.h-72')).not.toBeNull();
    expect(container.querySelectorAll('.sm\\:grid-cols-3 > *')).toHaveLength(3);
  });
});
