import { render } from '@testing-library/react';

import { ButtonSkeleton } from '@/shared/presentation/ui/components/skeletons/button-skeleton';

describe('ButtonSkeleton', () => {
  it('should render a single skeleton block sized like a button', () => {
    const { container } = render(<ButtonSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');

    expect(skeletons).toHaveLength(1);
    expect(skeletons[0]).toHaveClass('h-12');
  });

  it('should accept a custom width via className', () => {
    const { container } = render(<ButtonSkeleton className='w-48' />);

    expect(container.querySelector('[data-slot="skeleton"]')).toHaveClass(
      'w-48',
    );
  });
});
