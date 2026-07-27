import { render, screen } from '@testing-library/react';

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
