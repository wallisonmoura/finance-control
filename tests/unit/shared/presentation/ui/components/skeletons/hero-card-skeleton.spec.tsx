import { render } from '@testing-library/react';

import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';

describe('HeroCardSkeleton', () => {
  it('should render the 4 base blocks when subStatsCount is not given', () => {
    const { container } = render(<HeroCardSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4);
  });

  it('should render extra sub-stat blocks when subStatsCount is greater than zero', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={3} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4 + 3 * 3);
  });

  it('should not render extra blocks when subStatsCount is zero', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={0} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4);
  });

  it('should render a background opaque enough to stay visible regardless of page theme, matching the real hero', () => {
    const { container } = render(<HeroCardSkeleton />);

    const card = container.querySelector('[data-slot="card"]');

    expect(card).toHaveClass('bg-hero');
    expect(card).not.toHaveClass('bg-hero/5');
  });
});
