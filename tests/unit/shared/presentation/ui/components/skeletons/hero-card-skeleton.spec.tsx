import { render } from '@testing-library/react';

import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';

describe('HeroCardSkeleton', () => {
  it('deve renderizar os 4 blocos base quando subStatsCount não for informado', () => {
    const { container } = render(<HeroCardSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4);
  });

  it('deve renderizar blocos extras de sub-estatística quando subStatsCount for maior que zero', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={3} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4 + 3 * 3);
  });

  it('não deve renderizar blocos extras quando subStatsCount for zero', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={0} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4);
  });
});
