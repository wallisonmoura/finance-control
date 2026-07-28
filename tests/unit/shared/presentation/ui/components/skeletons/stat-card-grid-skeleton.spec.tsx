import { render } from '@testing-library/react';

import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';

describe('StatCardGridSkeleton', () => {
  it('deve renderizar 3 cards com 4 blocos cada quando count não for informado', () => {
    const { container } = render(<StatCardGridSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(3 * 4);
  });

  it('deve renderizar a quantidade de cards informada em count', () => {
    const { container } = render(<StatCardGridSkeleton count={2} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2 * 4);
  });
});
