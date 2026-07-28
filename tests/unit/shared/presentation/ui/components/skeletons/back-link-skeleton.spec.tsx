import { render } from '@testing-library/react';

import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';

describe('BackLinkSkeleton', () => {
  it('deve renderizar uma barra de skeleton', () => {
    const { container } = render(<BackLinkSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(1);
  });
});
