import { render } from '@testing-library/react';

import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';

describe('StatCardGridSkeleton', () => {
  it('should render 3 cards with 4 blocks each when count is not given', () => {
    const { container } = render(<StatCardGridSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(3 * 4);
  });

  it('should render the number of cards given in count', () => {
    const { container } = render(<StatCardGridSkeleton count={2} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2 * 4);
  });
});
