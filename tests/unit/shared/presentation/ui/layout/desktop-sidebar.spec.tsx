import { render, screen } from '@testing-library/react';

import { DesktopSidebar } from '@/shared/presentation/ui/layout/desktop-sidebar';

describe('DesktopSidebar', () => {
  it('should render the application name', () => {
    render(<DesktopSidebar pathname='/dashboard' />);

    expect(screen.getByText('Finance Control')).toBeInTheDocument();
    expect(screen.getByText('Controle financeiro')).toBeInTheDocument();
  });

  it('should render the main navigation links', () => {
    render(<DesktopSidebar pathname='/dashboard' />);

    expect(screen.getByRole('link', { name: 'Painel' })).toHaveAttribute(
      'href',
      '/dashboard',
    );

    expect(screen.getByRole('link', { name: 'Carteira' })).toHaveAttribute(
      'href',
      '/wallet',
    );

    expect(screen.getByRole('link', { name: 'Financeiro' })).toHaveAttribute(
      'href',
      '/finance',
    );

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'href',
      '/debts',
    );
  });

  it('should render the navigation landmark', () => {
    render(<DesktopSidebar pathname='/dashboard' />);

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument();
  });

  it('should mark the active link', () => {
    render(<DesktopSidebar pathname='/wallet' />);

    expect(screen.getByRole('link', { name: 'Carteira' })).toHaveAttribute(
      'aria-current',
      'page',
    );

    expect(screen.getByRole('link', { name: 'Painel' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should mark parent link as active for subroutes', () => {
    render(<DesktopSidebar pathname='/finance/incomes' />);

    expect(screen.getByRole('link', { name: 'Financeiro' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
