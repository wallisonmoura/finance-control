import { render } from '@testing-library/react';

import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';

describe('PageTitleSkeleton', () => {
  it('deve renderizar duas barras de skeleton (título e descrição)', () => {
    const { container } = render(<PageTitleSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2);
  });
});
