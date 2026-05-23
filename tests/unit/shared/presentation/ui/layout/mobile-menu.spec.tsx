import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MobileMenu } from '@/shared/presentation/ui/layout/mobile-menu';

describe('MobileMenu', () => {
  it('should render the application name', () => {
    render(<MobileMenu pathname='/dashboard' />);

    expect(
      screen.getByRole('img', { name: 'Finance Control' }),
    ).toBeInTheDocument();
  });

  it('should start with the navigation menu closed', () => {
    render(<MobileMenu pathname='/dashboard' />);

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('should open the navigation menu when clicking the menu button', async () => {
    const user = userEvent.setup();

    render(<MobileMenu pathname='/dashboard' />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('should close the navigation menu when clicking the menu button twice', async () => {
    const user = userEvent.setup();

    render(<MobileMenu pathname='/dashboard' />);

    const menuButton = screen.getByRole('button', { name: 'Abrir menu' });

    await user.click(menuButton);
    await user.click(screen.getByRole('button', { name: 'Fechar menu' }));

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('should render the main navigation links when open', async () => {
    const user = userEvent.setup();

    render(<MobileMenu pathname='/dashboard' />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

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

  it('should mark the active mobile link', async () => {
    const user = userEvent.setup();

    render(<MobileMenu pathname='/debts' />);

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should close the menu when clicking a navigation link', () => {
    render(<MobileMenu pathname='/dashboard' />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(
      screen.getByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Carteira' }));

    expect(
      screen.queryByRole('navigation', {
        name: 'Navegação principal mobile',
      }),
    ).not.toBeInTheDocument();
  });

  it('should mark parent mobile link as active for subroutes', () => {
    render(<MobileMenu pathname='/debts/pending' />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
