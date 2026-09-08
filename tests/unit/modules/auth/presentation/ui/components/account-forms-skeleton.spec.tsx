import { render } from '@testing-library/react';

import { AccountFormsSkeleton } from '@/modules/auth/presentation/ui/components/account-forms-skeleton';

describe('AccountFormsSkeleton', () => {
  it('should render 2 cards side by side, matching AccountPageContent', () => {
    const { container } = render(<AccountFormsSkeleton />);

    const grid = container.querySelector('.grid.gap-6.lg\\:grid-cols-2');
    expect(grid).not.toBeNull();
    expect(grid?.querySelectorAll('[data-slot="card"]')).toHaveLength(2);
  });

  it('should render 2 field placeholders and a button on the profile card, matching UpdateProfileForm', () => {
    const { container } = render(<AccountFormsSkeleton />);

    const [profileCard] = container.querySelectorAll('[data-slot="card"]');

    expect(
      profileCard.querySelectorAll('.space-y-1\\.5'),
    ).toHaveLength(2);
  });

  it('should render 3 field placeholders on the password card, matching ChangePasswordForm', () => {
    const { container } = render(<AccountFormsSkeleton />);

    const [, passwordCard] = container.querySelectorAll('[data-slot="card"]');

    expect(
      passwordCard.querySelectorAll('.space-y-1\\.5'),
    ).toHaveLength(3);
  });
});
