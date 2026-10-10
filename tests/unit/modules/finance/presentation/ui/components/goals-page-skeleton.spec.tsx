import { render, screen } from '@testing-library/react';

import { GoalsPageSkeleton } from '@/modules/finance/presentation/ui/components/goals-page-skeleton';
import { IncomeGoalsSectionSkeleton } from '@/modules/finance/presentation/ui/components/income-goals-section-skeleton';

describe('goals page skeletons', () => {
  it('should mirror the income goals section: title, button and two goal rows', () => {
    const { container } = render(<IncomeGoalsSectionSkeleton />);

    // title + description (2) + button (1) + 2 rows × (dot + 3 lines)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(11);
  });

  it('should stack the page title, the income section and the spending section', () => {
    const { container } = render(<GoalsPageSkeleton />);

    expect(screen.queryByRole('heading')).toBeNull();
    // page title (2) + income section (11) + spending section (15)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(28);
  });
});
