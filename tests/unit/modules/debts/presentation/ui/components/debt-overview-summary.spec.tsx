import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtOverviewSummary } from '@/modules/debts/presentation/ui/components/debt-overview-summary';

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

describe('DebtOverviewSummary', () => {
  it('should render debt indicators and shortcuts', () => {
    render(<DebtOverviewSummary debts={debts} onCreateDebt={jest.fn()} />);

    expect(screen.getByText('Dívidas pendentes')).toBeInTheDocument();
    expect(screen.getByText('Valor pendente')).toBeInTheDocument();
    expect(screen.getByText('Dívidas pagas')).toBeInTheDocument();
    expect(screen.getByText('Valor pago')).toBeInTheDocument();
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver pendentes' })).toHaveAttribute(
      'href',
      '/debts/pending',
    );
    expect(screen.getByRole('link', { name: 'Ver pagas' })).toHaveAttribute(
      'href',
      '/debts/paid',
    );
  });

  it('should call create action', async () => {
    const user = userEvent.setup();
    const onCreateDebt = jest.fn();

    render(<DebtOverviewSummary debts={debts} onCreateDebt={onCreateDebt} />);

    await user.click(screen.getByRole('button', { name: 'Nova dívida' }));

    expect(onCreateDebt).toHaveBeenCalledTimes(1);
  });
});
