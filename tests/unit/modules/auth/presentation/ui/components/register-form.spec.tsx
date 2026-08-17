import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { RegisterForm } from '@/modules/auth/presentation/ui/components/register-form';
import { signUp } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  signUp: jest.fn(),
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

const mockedSignUp = jest.mocked(signUp);

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/nome completo/i), 'Admin Local');
  await user.type(
    screen.getByLabelText(/e-mail/i),
    'admin@financecontrol.com',
  );
  await user.type(screen.getByLabelText(/^senha$/i), '12345678');
  await user.type(screen.getByLabelText(/confirmar senha/i), '12345678');
}

describe('RegisterForm', () => {
  beforeEach(() => {
    mockedSignUp.mockReset();
    mockReplace.mockReset();
    mockRefresh.mockReset();
  });

  it('should render register form fields and submit button', () => {
    render(<RegisterForm />);

    expect(
      screen.getByRole('heading', {
        name: /crie sua conta/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    ).toBeInTheDocument();
  });

  it('should submit registration data and redirect to the dashboard when it succeeds', async () => {
    const user = userEvent.setup();

    mockedSignUp.mockResolvedValueOnce({
      data: null,
    });

    render(<RegisterForm />);

    await fillValidForm(user);

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    await waitFor(() => {
      expect(mockedSignUp).toHaveBeenCalledWith({
        name: 'Admin Local',
        email: 'admin@financecontrol.com',
        password: '12345678',
      });
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('should show error toast when registration fails', async () => {
    const user = userEvent.setup();

    mockedSignUp.mockResolvedValueOnce({
      error: 'E-mail já cadastrado',
    });

    render(<RegisterForm />);

    await fillValidForm(user);

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('E-mail já cadastrado');
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it('should validate required name before submitting', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );
    await user.type(screen.getByLabelText(/^senha$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar senha/i), '12345678');

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();

    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it('should validate email format before submitting', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Admin Local');
    await user.type(screen.getByLabelText(/e-mail/i), 'email-invalido');
    await user.type(screen.getByLabelText(/^senha$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar senha/i), '12345678');

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    expect(
      await screen.findByText('Informe um e-mail válido.'),
    ).toBeInTheDocument();

    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it('should validate minimum password length before submitting', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Admin Local');
    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );
    await user.type(screen.getByLabelText(/^senha$/i), '1234567');
    await user.type(screen.getByLabelText(/confirmar senha/i), '1234567');

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    expect(
      await screen.findByText('A senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument();

    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it('should validate that password and confirmation match before submitting', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nome completo/i), 'Admin Local');
    await user.type(
      screen.getByLabelText(/e-mail/i),
      'admin@financecontrol.com',
    );
    await user.type(screen.getByLabelText(/^senha$/i), '12345678');
    await user.type(screen.getByLabelText(/confirmar senha/i), '87654321');

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument();

    expect(mockedSignUp).not.toHaveBeenCalled();
  });

  it('should toggle password and confirm password visibility independently', async () => {
    const user = userEvent.setup();

    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^senha$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', {
      name: /mostrar caracteres/i,
    });

    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    await user.click(toggleButtons[1]);
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  it('should show loading state while registration is pending', async () => {
    const user = userEvent.setup();

    let resolveSignUp: (value: { data: null }) => void;

    mockedSignUp.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSignUp = resolve;
        }),
    );

    render(<RegisterForm />);

    await fillValidForm(user);

    await user.click(
      screen.getByRole('button', {
        name: /^criar conta$/i,
      }),
    );

    expect(
      screen.getByRole('button', {
        name: /criando conta/i,
      }),
    ).toBeDisabled();

    resolveSignUp!({
      data: null,
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});
