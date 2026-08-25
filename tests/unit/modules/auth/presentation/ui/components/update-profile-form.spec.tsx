import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { UpdateProfileForm } from '@/modules/auth/presentation/ui/components/update-profile-form';
import { updateProfile } from '@/modules/auth/presentation/ui/services/auth-api.service';

jest.mock('next/navigation');
jest.mock('@/modules/auth/presentation/ui/services/auth-api.service');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const useRouterMock = jest.mocked(useRouter);
const updateProfileMock = jest.mocked(updateProfile);

const user = {
  id: 'user-1',
  name: 'Wallison',
  email: 'wallison@financecontrol.com',
};

describe('UpdateProfileForm', () => {
  const refresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue({
      refresh,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('should render the current name and a read-only email', () => {
    render(<UpdateProfileForm user={user} />);

    expect(screen.getByLabelText('Nome')).toHaveValue('Wallison');
    expect(screen.getByLabelText('E-mail')).toHaveValue(
      'wallison@financecontrol.com',
    );
    expect(screen.getByLabelText('E-mail')).toBeDisabled();
  });

  it('should submit the new name and refresh the router on success', async () => {
    const userEventInstance = userEvent.setup();
    updateProfileMock.mockResolvedValue({
      data: { user: { ...user, name: 'Wallison Moura' } },
    });

    render(<UpdateProfileForm user={user} />);

    await userEventInstance.clear(screen.getByLabelText('Nome'));
    await userEventInstance.type(screen.getByLabelText('Nome'), 'Wallison Moura');
    await userEventInstance.click(
      screen.getByRole('button', { name: 'Salvar nome' }),
    );

    expect(updateProfileMock).toHaveBeenCalledWith({ name: 'Wallison Moura' });
    expect(toast.success).toHaveBeenCalledWith('Nome atualizado com sucesso.');
    expect(refresh).toHaveBeenCalled();
  });

  it('should show a validation error and not submit when name is empty', async () => {
    const userEventInstance = userEvent.setup();

    render(<UpdateProfileForm user={user} />);

    await userEventInstance.clear(screen.getByLabelText('Nome'));
    await userEventInstance.click(
      screen.getByRole('button', { name: 'Salvar nome' }),
    );

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it('should show a toast error and not refresh when the request fails', async () => {
    const userEventInstance = userEvent.setup();
    updateProfileMock.mockResolvedValue({ error: 'Erro ao atualizar.' });

    render(<UpdateProfileForm user={user} />);

    await userEventInstance.click(
      screen.getByRole('button', { name: 'Salvar nome' }),
    );

    expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar.');
    expect(refresh).not.toHaveBeenCalled();
  });
});
