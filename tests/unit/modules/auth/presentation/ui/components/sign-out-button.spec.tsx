import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { signOut } from '@/modules/auth/presentation/ui/services/auth-api.service';
import { SignOutButton } from '@/modules/auth/presentation/ui/components/sign-out-button';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
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

const mockedSignOut = jest.mocked(signOut);

describe('SignOutButton', () => {
  beforeEach(() => {
    mockedSignOut.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it('should render sign-out button', () => {
    render(<SignOutButton />);

    expect(
      screen.getByRole('button', {
        name: /sair/i,
      }),
    ).toBeInTheDocument();
  });

  it('should call signOut and redirect to login when clicked', async () => {
    const user = userEvent.setup();

    mockedSignOut.mockResolvedValueOnce({
      data: null,
    });

    render(<SignOutButton />);

    await user.click(
      screen.getByRole('button', {
        name: /sair/i,
      }),
    );

    await waitFor(() => {
      expect(mockedSignOut).toHaveBeenCalled();
    });

    expect(mockReplace).toHaveBeenCalledWith('/login');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should show loading state while sign-out is pending', async () => {
    const user = userEvent.setup();

    let resolveSignOut: (value: { data: null }) => void;

    mockedSignOut.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignOut = resolve;
        }),
    );

    render(<SignOutButton />);

    await user.click(
      screen.getByRole('button', {
        name: /sair/i,
      }),
    );

    expect(
      screen.getByRole('button', {
        name: /saindo/i,
      }),
    ).toBeDisabled();

    resolveSignOut!({
      data: null,
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    expect(mockRefresh).toHaveBeenCalled();
  });
});
