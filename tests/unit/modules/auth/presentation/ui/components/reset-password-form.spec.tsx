import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ResetPasswordForm } from '@/modules/auth/presentation/ui/components/reset-password-form';
import { resetPassword } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  resetPassword: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockedReset = jest.mocked(resetPassword);

async function fillAndSubmit(password: string, confirmation: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nova senha'), password);
  await user.type(screen.getByLabelText('Confirmar nova senha'), confirmation);
  await user.click(screen.getByRole('button', { name: 'Salvar nova senha' }));
}

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    mockedReset.mockReset();
    mockPush.mockReset();
  });

  it('should start with the focus on the new password field', () => {
    render(<ResetPasswordForm token='abc' />);

    expect(screen.getByLabelText('Nova senha')).toHaveFocus();
  });

  it('should refuse different passwords without calling the server', async () => {
    render(<ResetPasswordForm token='abc' />);

    await fillAndSubmit('nova-senha-123', 'outra-senha-123');

    expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    expect(mockedReset).not.toHaveBeenCalled();
  });

  it('should send the token and the new password, then go to the login', async () => {
    mockedReset.mockResolvedValueOnce({ data: null });
    render(<ResetPasswordForm token='abc' />);

    await fillAndSubmit('nova-senha-123', 'nova-senha-123');

    expect(mockedReset).toHaveBeenCalledWith({ token: 'abc', newPassword: 'nova-senha-123' });
    expect(mockPush).toHaveBeenCalledWith('/login?reset=success');
  });

  it('should explain an expired link and offer a new one', async () => {
    mockedReset.mockResolvedValueOnce({ error: 'Este link expirou ou já foi usado.', invalidLink: true });
    render(<ResetPasswordForm token='abc' />);

    await fillAndSubmit('nova-senha-123', 'nova-senha-123');

    expect(await screen.findByText('Este link expirou ou já foi usado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pedir um novo link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should keep the form on any other error', async () => {
    mockedReset.mockResolvedValueOnce({ error: 'Sem conexão com a internet. Verifique e tente novamente.' });
    render(<ResetPasswordForm token='abc' />);

    await fillAndSubmit('nova-senha-123', 'nova-senha-123');

    expect(toast.error).toHaveBeenCalledWith('Sem conexão com a internet. Verifique e tente novamente.');
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
  });

  it('should show the invalid link state when there is no token', () => {
    render(<ResetPasswordForm token={null} />);

    expect(screen.getByText('Este link expirou ou já foi usado.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
  });
});
