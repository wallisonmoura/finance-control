import { render } from '@testing-library/react';

import { BackLinkSkeleton } from '@/shared/presentation/ui/components/skeletons/back-link-skeleton';

describe('BackLinkSkeleton', () => {
  it('should render a skeleton bar', () => {
    const { container } = render(<BackLinkSkeleton />);

    expect(
      container.querySelectorAll('[data-slot="skeleton"]'),
    ).toHaveLength(1);
  });
});
