import { render, screen } from '@testing-library/react';

import { PaidDebtsPageContent } from '@/modules/debts/presentation/ui/components/paid-debts-page-content';
import { useDebts } from '@/modules/debts/presentation/ui/hooks/use-debts';

jest.mock('@/modules/debts/presentation/ui/hooks/use-debts');

const useDebtsMock = jest.mocked(useDebts);

const pendingDebt = {
  id: 'pending-debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: '2026-05-20T00:00:00.000Z',
  type: 'ONE_TIME' as const,
  status: 'PENDING' as const,
  notes: null,
  paidAt: null,
  paymentSource: null,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

const paidDebt = {
  ...pendingDebt,
  id: 'paid-debt-id',
  description: 'IPVA',
  amount: 500,
  status: 'PAID' as const,
  paidAt: '2026-05-18T00:00:00.000Z',
  paymentSource: 'BANK' as const,
};

describe('PaidDebtsPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useDebtsMock.mockReturnValue({
      debts: [pendingDebt, paidDebt],
      isLoading: false,
      error: null,
      refresh: jest.fn(),
    });
  });

  it('should render only paid debts', () => {
    render(<PaidDebtsPageContent />);

    expect(screen.getByText('Dívidas pagas')).toBeInTheDocument();
    expect(screen.getByText('IPVA')).toBeInTheDocument();
    expect(screen.queryByText('Seguro do carro')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voltar para dívidas' })).toHaveAttribute(
      'href',
      '/debts',
    );
    expect(screen.queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Excluir' })).not.toBeInTheDocument();
  });
});
