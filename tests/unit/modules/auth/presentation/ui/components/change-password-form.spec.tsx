import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ChangePasswordForm } from '@/modules/auth/presentation/ui/components/change-password-form';
import { changePassword } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const changePasswordMock = jest.mocked(changePassword);

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  values: {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
  },
) {
  if (values.currentPassword !== undefined) {
    await user.type(
      screen.getByLabelText('Senha atual'),
      values.currentPassword,
    );
  }

  if (values.newPassword !== undefined) {
    await user.type(screen.getByLabelText('Nova senha'), values.newPassword);
  }

  if (values.confirmNewPassword !== undefined) {
    await user.type(
      screen.getByLabelText('Confirmar nova senha'),
      values.confirmNewPassword,
    );
  }

  await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
}

describe('ChangePasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should submit the current and new password, then reset the form on success', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockResolvedValue({ data: null });

    render(<ChangePasswordForm />);

    await fillAndSubmit(user, {
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
      confirmNewPassword: 'new-password-123',
    });

    expect(changePasswordMock).toHaveBeenCalledWith({
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
    });
    expect(toast.success).toHaveBeenCalledWith('Senha alterada com sucesso.');
    expect(screen.getByLabelText('Senha atual')).toHaveValue('');
    expect(screen.getByLabelText('Nova senha')).toHaveValue('');
  });

  it('should show a validation error and not submit when the confirmation does not match', async () => {
    const user = userEvent.setup();

    render(<ChangePasswordForm />);

    await fillAndSubmit(user, {
      currentPassword: 'current-password',
      newPassword: 'new-password-123',
      confirmNewPassword: 'something-else',
    });

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('should show a validation error when the new password is shorter than 8 characters', async () => {
    const user = userEvent.setup();

    render(<ChangePasswordForm />);

    await fillAndSubmit(user, {
      currentPassword: 'current-password',
      newPassword: '1234567',
      confirmNewPassword: '1234567',
    });

    expect(
      await screen.findByText('A nova senha deve ter pelo menos 8 caracteres'),
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it('should show a toast error and keep the fields filled when the request fails', async () => {
    const user = userEvent.setup();
    changePasswordMock.mockResolvedValue({ error: 'Credenciais inválidas.' });

    render(<ChangePasswordForm />);

    await fillAndSubmit(user, {
      currentPassword: 'wrong-password',
      newPassword: 'new-password-123',
      confirmNewPassword: 'new-password-123',
    });

    expect(toast.error).toHaveBeenCalledWith('Credenciais inválidas.');
    expect(screen.getByLabelText('Senha atual')).toHaveValue('wrong-password');
  });
});
