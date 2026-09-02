import { render, screen } from '@testing-library/react';

import { DebtsMonthSummary } from '@/modules/debts/presentation/ui/components/debts-month-summary';

const debts = [
  {
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
  },
  {
    id: 'paid-debt-id',
    userId: 'user-id',
    description: 'IPVA',
    amount: 500,
    dueDate: '2026-05-10T00:00:00.000Z',
    type: 'ONE_TIME' as const,
    status: 'PAID' as const,
    notes: null,
    paidAt: '2026-05-10T00:00:00.000Z',
    paymentSource: 'BANK' as const,
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
  },
];

describe('DebtsMonthSummary', () => {
  it('should sum and count only pending debts from the given list', () => {
    render(<DebtsMonthSummary debts={debts} />);

    expect(screen.getByText('Valor pendente no mês')).toBeInTheDocument();
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
    expect(screen.getByText('Dívidas pendentes no mês')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should sum paid debts from the given paidDebts list', () => {
    render(<DebtsMonthSummary debts={[]} paidDebts={debts} />);

    expect(screen.getByText('Valor pago no mês')).toBeInTheDocument();
    expect(screen.getByText('R$ 800,00')).toBeInTheDocument();
  });

  it('should render zero when there are no debts in either list', () => {
    render(<DebtsMonthSummary debts={[]} paidDebts={[]} />);

    expect(screen.getAllByText('R$ 0,00')).toHaveLength(2);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
