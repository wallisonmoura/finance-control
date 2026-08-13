import { render } from '@testing-library/react';

import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';

describe('PageTitleSkeleton', () => {
  it('should render two skeleton bars (title and description)', () => {
    const { container } = render(<PageTitleSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(2);
  });
});
