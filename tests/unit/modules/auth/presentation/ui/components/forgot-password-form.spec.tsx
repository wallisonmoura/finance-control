import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ForgotPasswordForm } from '@/modules/auth/presentation/ui/components/forgot-password-form';
import { requestPasswordReset } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('@/modules/auth/presentation/ui/services/auth-api.service', () => ({
  requestPasswordReset: jest.fn(),
}));
jest.mock('sonner', () => ({ toast: { error: jest.fn() } }));

const mockedRequest = jest.mocked(requestPasswordReset);
const SENT_MESSAGE =
  'Se esse e-mail estiver cadastrado, enviamos um link pra criar uma nova senha. Confira também a caixa de spam.';

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it('should start with the focus on the e-mail field', () => {
    render(<ForgotPasswordForm />);

    expect(screen.getByLabelText('E-mail')).toHaveFocus();
  });

  it('should send the typed e-mail and then show the fixed message', async () => {
    const user = userEvent.setup();
    mockedRequest.mockResolvedValueOnce({ data: { message: SENT_MESSAGE } });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));

    expect(mockedRequest).toHaveBeenCalledWith({ email: 'ana@example.com' });
    const message = await screen.findByText(SENT_MESSAGE);
    expect(message.closest('[tabindex="-1"]')).toHaveFocus();
    expect(screen.queryByLabelText('E-mail')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/login');
  });

  it('should tie the e-mail error to the field', async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));

    const field = screen.getByLabelText('E-mail');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', 'email-error');
    expect(mockedRequest).not.toHaveBeenCalled();
  });

  it('should keep the form and show the error when the request fails', async () => {
    const user = userEvent.setup();
    mockedRequest.mockResolvedValueOnce({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    render(<ForgotPasswordForm />);

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com');
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));

    expect(toast.error).toHaveBeenCalledWith('Muitas tentativas. Tente novamente em alguns minutos.');
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
  });
});
