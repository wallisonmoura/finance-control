import { NavigationLink } from '@/shared/presentation/ui/layout/navigation-link';
import { render, screen } from '@testing-library/react';

describe('NavigationLink', () => {
  it('should render the navigation label', () => {
    render(<NavigationLink href='/dashboard' label='Dashboard' />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('should render the correct href', () => {
    render(<NavigationLink href='/wallet' label='Wallet' />);

    expect(screen.getByRole('link', { name: 'Wallet' })).toHaveAttribute(
      'href',
      '/wallet',
    );
  });

  it('should set aria-current when link is active', () => {
    render(<NavigationLink href='/dashboard' label='Dashboard' isActive />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should not set aria-current when link is not active', () => {
    render(<NavigationLink href='/dashboard' label='Dashboard' />);

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
    );
  });
});
