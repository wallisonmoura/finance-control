import { render, screen, within } from '@testing-library/react';

import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

const mockUsePathname = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

describe('PrivateNavigation', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render the desktop navigation', () => {
    render(<PrivateNavigation />);

    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeInTheDocument();
  });

  it('should render the mobile menu button', () => {
    render(<PrivateNavigation />);

    expect(
      screen.getByRole('button', { name: 'Abrir menu' }),
    ).toBeInTheDocument();
  });

  it('should render the due-soon debts bell', () => {
    render(<PrivateNavigation />);

    expect(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    ).toBeInTheDocument();
  });

  it('should thread pending debts down to the due-soon bell', () => {
    const debtDueToday: DebtUi = {
      id: 'debt-1',
      userId: 'user-1',
      description: 'Aluguel',
      amount: 1200,
      dueDate: new Date().toISOString(),
      type: 'ONE_TIME',
      status: 'PENDING',
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    render(<PrivateNavigation initialPendingDebts={[debtDueToday]} />);

    const bellButton = screen.getByRole('button', {
      name: 'Dívidas vencendo em breve',
    });

    expect(within(bellButton).getByText('1')).toBeInTheDocument();
  });

  it('should mark the current pathname as active', () => {
    mockUsePathname.mockReturnValue('/finance');

    render(<PrivateNavigation />);

    expect(screen.getByRole('link', { name: 'Financeiro' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
