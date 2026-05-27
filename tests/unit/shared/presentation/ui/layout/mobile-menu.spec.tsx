import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getCurrentUser } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { MobileMenu } from '@/shared/presentation/ui/layout/mobile-menu';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();
const mockedGetCurrentUser = jest.mocked(getCurrentUser);
const currentUser = {
  id: 'user-id',
  name: 'Admin Local',
  email: 'admin@financecontrol.com',
};

function renderMobileMenu(pathname = '/dashboard') {
  return render(<MobileMenu pathname={pathname} currentUser={currentUser} />);
}

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

describe('MobileMenu', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockRefresh.mockReset();
    mockedGetCurrentUser.mockResolvedValue({
      data: {
        user: currentUser,
      },
    });
  });

  it('should render the application name', () => {
    renderMobileMenu();

    expect(
      screen.getByRole('img', { name: 'Finance Control' }),
    ).toBeInTheDocument();
  });

  it('should start with the navigation menu closed', () => {
    renderMobileMenu();

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

    renderMobileMenu();

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

    renderMobileMenu();

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

    renderMobileMenu();

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

  it('should render the current user controls inside the open menu', async () => {
    const user = userEvent.setup();

    renderMobileMenu();

    expect(screen.queryByText('Admin Local')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByText('Admin Local')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('should mark the active mobile link', async () => {
    const user = userEvent.setup();

    renderMobileMenu('/debts');

    await user.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should close the menu when clicking a navigation link', () => {
    renderMobileMenu();

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
    renderMobileMenu('/debts/pending');

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));

    expect(screen.getByRole('link', { name: 'Dívidas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
