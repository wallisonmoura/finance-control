import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { LoginForm } from '@/modules/auth/presentation/ui/components/login-form';
import { signIn } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  signIn: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

const mockReplace = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    refresh: mockRefresh,
  }),
}));

const mockedSignIn = jest.mocked(signIn);

describe('LoginForm', () => {
  beforeEach(() => {
    mockedSignIn.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it('should render login form fields and submit button', () => {
    render(<LoginForm redirectTo='/dashboard' />);

    expect(
      screen.getByRole('heading', {
        name: /entrar/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    ).toBeInTheDocument();
  });

  it('should submit credentials and redirect when sign-in succeeds', async () => {
    const user = userEvent.setup();

    mockedSignIn.mockResolvedValueOnce({
      data: null,
    });

    render(<LoginForm redirectTo='/dashboard' />);

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );

    await user.type(screen.getByLabelText(/senha/i), '123456');

    await user.click(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    );

    await waitFor(() => {
      expect(mockedSignIn).toHaveBeenCalledWith({
        email: 'admin@financecontrol.com',
        password: '123456',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should redirect to provided redirectTo when sign-in succeeds', async () => {
    const user = userEvent.setup();

    mockedSignIn.mockResolvedValueOnce({
      data: null,
    });

    render(<LoginForm redirectTo='/wallet' />);

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );

    await user.type(screen.getByLabelText(/senha/i), '123456');

    await user.click(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/wallet');
    });

    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should show error toast when sign-in fails', async () => {
    const user = userEvent.setup();

    mockedSignIn.mockResolvedValueOnce({
      error: 'Credenciais inválidas',
    });

    render(<LoginForm redirectTo='/dashboard' />);

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );

    await user.type(screen.getByLabelText(/senha/i), 'wrong-password');

    await user.click(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas');
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should validate fields before submitting credentials', async () => {
    const user = userEvent.setup();

    render(<LoginForm redirectTo='/dashboard' />);

    await user.type(screen.getByLabelText(/e-mail/i), 'email-invalido');
    await user.type(screen.getByLabelText(/senha/i), '123456');

    await user.click(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    );

    expect(
      await screen.findByText('Informe um e-mail válido.'),
    ).toBeInTheDocument();

    expect(mockedSignIn).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();

    render(<LoginForm redirectTo='/dashboard' />);

    const passwordInput = screen.getByLabelText(/senha/i);

    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(
      screen.getByRole('button', {
        name: /mostrar caracteres/i,
      }),
    );

    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(
      screen.getByRole('button', {
        name: /ocultar caracteres/i,
      }),
    );

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show loading state while sign-in is pending', async () => {
    const user = userEvent.setup();

    let resolveSignIn: (value: { data: null }) => void;

    mockedSignIn.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignIn = resolve;
        }),
    );

    render(<LoginForm redirectTo='/dashboard' />);

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );

    await user.type(screen.getByLabelText(/senha/i), '123456');

    await user.click(
      screen.getByRole('button', {
        name: /entrar/i,
      }),
    );

    expect(
      screen.getByRole('button', {
        name: /entrando/i,
      }),
    ).toBeDisabled();

    resolveSignIn!({
      data: null,
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });
});
