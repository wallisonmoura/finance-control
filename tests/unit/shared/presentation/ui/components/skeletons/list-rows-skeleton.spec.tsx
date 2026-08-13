import { render } from '@testing-library/react';

import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

describe('ListRowsSkeleton', () => {
  it('should render 4 rows with 5 blocks each when count is not given', () => {
    const { container } = render(<ListRowsSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4 * 5);
  });

  it('should render the number of rows given in count', () => {
    const { container } = render(<ListRowsSkeleton count={2} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2 * 5);
  });
});
