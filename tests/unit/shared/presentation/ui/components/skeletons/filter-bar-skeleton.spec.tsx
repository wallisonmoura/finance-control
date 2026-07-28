import { render } from '@testing-library/react';

import { FilterBarSkeleton } from '@/shared/presentation/ui/components/skeletons/filter-bar-skeleton';

describe('FilterBarSkeleton', () => {
  it('deve renderizar 3 blocos de campo quando fieldCount não for informado', () => {
    const { container } = render(<FilterBarSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(3);
  });

  it('deve renderizar a quantidade de campos informada em fieldCount', () => {
    const { container } = render(<FilterBarSkeleton fieldCount={1} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(1);
  });
});
