import { render } from '@testing-library/react';

import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

describe('ListRowsSkeleton', () => {
  it('deve renderizar 4 linhas com 5 blocos cada quando count não for informado', () => {
    const { container } = render(<ListRowsSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(4 * 5);
  });

  it('deve renderizar a quantidade de linhas informada em count', () => {
    const { container } = render(<ListRowsSkeleton count={2} />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2 * 5);
  });
});
