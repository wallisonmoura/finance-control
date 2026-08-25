import { render, screen } from '@testing-library/react';
import type { AuthenticatedUser } from '@/modules/auth/presentation/ui/types/auth-ui.types';

import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { getCurrentUser } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  getCurrentUser: jest.fn(),
  signOut: jest.fn(),
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

const mockedGetCurrentUser = jest.mocked(getCurrentUser);

describe('CurrentUserMenu', () => {
  beforeEach(() => {
    mockedGetCurrentUser.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it('should show loading state before loading current user', () => {
    mockedGetCurrentUser.mockImplementationOnce(
      () =>
        new Promise(() => {
          // mantém pendente para validar loading
        }),
    );

    render(<CurrentUserMenu />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /sair/i,
      }),
    ).toBeInTheDocument();
  });

  it('should show authenticated user name when current user is loaded', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({
      data: {
        user: {
          id: 'user-id',
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
        },
      },
    });

    render(<CurrentUserMenu />);

    expect(await screen.findByText('Admin Local')).toBeInTheDocument();
  });

  it('should show initial authenticated user without requesting current user again', () => {
    render(
      <CurrentUserMenu
        initialUser={{
          id: 'user-id',
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
        }}
      />,
    );

    expect(screen.getByText('Admin Local')).toBeInTheDocument();
    expect(mockedGetCurrentUser).not.toHaveBeenCalled();
  });

  it('should show fallback user name when current user request fails', async () => {
    mockedGetCurrentUser.mockResolvedValueOnce({
      error: 'Não autenticado',
    });

    render(<CurrentUserMenu />);

    expect(await screen.findByText('Usuário')).toBeInTheDocument();
  });

  it('should link the user info block to the account page', () => {
    render(
      <CurrentUserMenu
        initialUser={{
          id: 'user-id',
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
        }}
      />,
    );

    expect(screen.getByRole('link', { name: /admin local/i })).toHaveAttribute(
      'href',
      '/account',
    );
  });

  it('should update the displayed name when initialUser changes after a router.refresh()', () => {
    const originalUser: AuthenticatedUser = {
      id: 'user-id',
      name: 'Wallison',
      email: 'wallison@financecontrol.com',
    };
    const refreshedUser: AuthenticatedUser = {
      ...originalUser,
      name: 'Wallison Moura',
    };

    const { rerender } = render(<CurrentUserMenu initialUser={originalUser} />);

    expect(screen.getByText('Wallison')).toBeInTheDocument();

    rerender(<CurrentUserMenu initialUser={refreshedUser} />);

    expect(screen.getByText('Wallison Moura')).toBeInTheDocument();
    expect(screen.queryByText('Wallison')).not.toBeInTheDocument();
  });

  it('should render an optional slot between the user info and the sign-out button', () => {
    render(
      <CurrentUserMenu
        initialUser={{
          id: 'user-id',
          name: 'Admin Local',
          email: 'admin@financecontrol.com',
        }}
      >
        <button type='button'>Sino</button>
      </CurrentUserMenu>,
    );

    expect(screen.getByRole('button', { name: 'Sino' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });
});
