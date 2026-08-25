import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { AccountPageContent } from '@/modules/auth/presentation/ui/components/account-page-content';

jest.mock('next/navigation');
jest.mock(
  '@/modules/auth/presentation/ui/components/update-profile-form',
  () => ({
    UpdateProfileForm: ({ user }: { user: { name: string } }) => (
      <div data-testid='update-profile-form'>{user.name}</div>
    ),
  }),
);
jest.mock(
  '@/modules/auth/presentation/ui/components/change-password-form',
  () => ({
    ChangePasswordForm: () => <div data-testid='change-password-form' />,
  }),
);

const useRouterMock = jest.mocked(useRouter);

const user = {
  id: 'user-1',
  name: 'Wallison',
  email: 'wallison@financecontrol.com',
};

describe('AccountPageContent', () => {
  const refresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouterMock.mockReturnValue({
      refresh,
    } as unknown as ReturnType<typeof useRouter>);
  });

  it('should render the page title and both forms when the user is present', () => {
    render(<AccountPageContent initialUser={user} />);

    expect(screen.getByText('Conta')).toBeInTheDocument();
    expect(screen.getByTestId('update-profile-form')).toHaveTextContent(
      'Wallison',
    );
    expect(screen.getByTestId('change-password-form')).toBeInTheDocument();
  });

  it('should render an error state with retry when there is no user', () => {
    render(
      <AccountPageContent
        initialUser={null}
        initialError='Não foi possível carregar sua conta.'
      />,
    );

    expect(
      screen.getByText('Não foi possível carregar sua conta.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId('update-profile-form'),
    ).not.toBeInTheDocument();
  });
});
