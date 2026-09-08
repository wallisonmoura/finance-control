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

  it('should arrange content and sub-stats side by side at the lg breakpoint, matching the real HeroCard, without a divider it never has', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={2} />);

    const contentGrid = container.querySelector('[data-slot="card"] > div');

    expect(contentGrid).toHaveClass('lg:grid-cols-[1fr_auto]');
    expect(contentGrid).not.toHaveClass('border-t');
  });

  it('should render each sub-stat as its own boxed card, matching the real hero-foreground boxes', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={2} />);

    const subStatBoxes = container.querySelectorAll(
      '.border-hero-foreground\\/15.bg-hero-foreground\\/5',
    );

    expect(subStatBoxes).toHaveLength(2);
  });

  it('should lay 3 sub-stats out in a single row at the xl breakpoint, matching DebtOverviewSummary', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={3} />);

    const subStatsGrid = container.querySelector('.gap-3.sm\\:grid-cols-2');

    expect(subStatsGrid).toHaveClass('xl:grid-cols-3');
  });

  it('should not force a 3-column row for a 2-item sub-stats grid', () => {
    const { container } = render(<HeroCardSkeleton subStatsCount={2} />);

    const subStatsGrid = container.querySelector('.gap-3.sm\\:grid-cols-2');

    expect(subStatsGrid).not.toHaveClass('xl:grid-cols-3');
  });
});
