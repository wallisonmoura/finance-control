import { render, screen } from '@testing-library/react';

import { PaidDebtsPageContent } from '@/modules/debts/presentation/ui/components/paid-debts-page-content';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));

// Fixed request time, long past: only honoring the `now` prop (not the real
// clock) keeps a payment recorded an hour before it undoable.
const NOW = Date.parse('2026-05-18T15:00:00.000Z');
const HOUR_MS = 60 * 60 * 1000;

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
  paymentRecordedAt: null,
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
  });

  it('should render only paid debts', () => {
    render(<PaidDebtsPageContent debts={[pendingDebt, paidDebt]} now={NOW} />);

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

  it('should render error state', () => {
    render(<PaidDebtsPageContent debts={[]} error='Não autenticado' now={NOW} />);

    expect(screen.getByText('Não autenticado')).toBeInTheDocument();
  });

  it('should offer to undo only payments recorded in the last 24 hours', () => {
    const recent = {
      ...paidDebt,
      id: 'recent-id',
      description: 'Internet',
      paymentRecordedAt: new Date(NOW - HOUR_MS).toISOString(),
    };
    const expired = {
      ...paidDebt,
      id: 'expired-id',
      description: 'Água',
      paymentRecordedAt: new Date(NOW - 25 * HOUR_MS).toISOString(),
    };
    const legacy = { ...paidDebt, id: 'legacy-id', description: 'Luz', paymentRecordedAt: null };

    render(<PaidDebtsPageContent debts={[recent, expired, legacy]} now={NOW} />);

    expect(screen.getAllByRole('button', { name: /^Desfazer pagamento/ })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Desfazer pagamento de Internet' })).toBeInTheDocument();
  });
});
