import { render } from '@testing-library/react';

import { SpendingGoalsPageSkeleton } from '@/modules/finance/presentation/ui/components/spending-goals-page-skeleton';

describe('SpendingGoalsPageSkeleton', () => {
  it('should render the title, the new goal button and three goal rows', () => {
    const { container } = render(<SpendingGoalsPageSkeleton />);

    // title (2) + button (1) + 3 rows × (dot + 3 lines)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(15);
  });
});
