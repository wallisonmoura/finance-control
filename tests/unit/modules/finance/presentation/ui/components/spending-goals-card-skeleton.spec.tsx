import { render, screen } from '@testing-library/react';

import { SpendingGoalsCardSkeleton } from '@/modules/finance/presentation/ui/components/spending-goals-card-skeleton';

describe('SpendingGoalsCardSkeleton', () => {
  it('should render the static heading and three placeholder goal rows', () => {
    const { container } = render(<SpendingGoalsCardSkeleton />);

    expect(screen.getByRole('heading', { name: 'Metas do mês' })).toBeInTheDocument();
    // 3 rows × (dot + name + usage + sentence)
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(12);
  });
});
