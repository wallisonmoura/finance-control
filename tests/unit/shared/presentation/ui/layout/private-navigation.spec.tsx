import { render, screen } from '@testing-library/react';

import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';

const usePathnameMock = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

describe('PrivateNavigation', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the desktop navigation', () => {
    render(<PrivateNavigation />);

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument();
  });

  it('should render the mobile menu button', () => {
    render(<PrivateNavigation />);

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });

  it('should mark the current pathname as active', () => {
    usePathnameMock.mockReturnValue('/finance');

    render(<PrivateNavigation />);

    expect(screen.getByRole('link', { name: 'Finance' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
