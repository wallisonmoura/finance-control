import { render } from '@testing-library/react';

import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';

describe('FilterBarSkeleton', () => {
  it('should render 3 field blocks when fieldCount is not given', () => {
    const { container } = render(<FilterBarSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(3);
  });

  it('should render the number of fields given in fieldCount', () => {
    const { container } = render(<FilterBarSkeleton fieldCount={1} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(1);
  });
});
