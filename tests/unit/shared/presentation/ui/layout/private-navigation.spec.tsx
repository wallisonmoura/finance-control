import { render, screen } from '@testing-library/react';

import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('PrivateNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
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

    expect(
      screen.getByRole('button', { name: 'Abrir menu' }),
    ).toBeInTheDocument();
  });

  it('should render the due-soon debts bell', () => {
    render(<PrivateNavigation />);

    expect(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    ).toBeInTheDocument();
  });

  it('should mark the current pathname as active', () => {
    mockUsePathname.mockReturnValue('/finance');

    render(<PrivateNavigation />);

    expect(screen.getByRole('link', { name: 'Financeiro' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
