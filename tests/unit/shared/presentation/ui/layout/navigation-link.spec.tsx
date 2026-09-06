import { NavigationLink } from '@/shared/presentation/ui/layout/navigation-link';
import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';

jest.mock('next/link', () => {
  return function MockLink({
    href,
    prefetch,
    children,
    ...rest
  }: ComponentProps<'a'> & { href: string; prefetch?: boolean }) {
    return (
      <a href={href} data-prefetch={String(prefetch)} {...rest}>
        {children}
      </a>
    );
  };
});

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

  it('should prefetch eagerly so the target route is ready before click', () => {
    render(<NavigationLink href='/wallet' label='Wallet' />);

    expect(screen.getByRole('link', { name: 'Wallet' })).toHaveAttribute(
      'data-prefetch',
      'true',
    );
  });
});
