import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtList } from '@/modules/debts/presentation/ui/components/debt-list';

const pendingDebt = {
  id: 'pending-debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: '2026-05-20T00:00:00.000Z',
  type: 'ONE_TIME' as const,
  status: 'PENDING' as const,
  notes: 'Parcela única',
  paidAt: null,
  paymentSource: null,
  createdAt: '2026-05-16T00:00:00.000Z',
  updatedAt: '2026-05-16T00:00:00.000Z',
};

const paidDebt = {
  ...pendingDebt,
  id: 'paid-debt-id',
  description: 'IPVA',
  status: 'PAID' as const,
  paidAt: '2026-05-18T00:00:00.000Z',
};

describe('DebtList', () => {
  it('should render debts', () => {
    render(<DebtList debts={[pendingDebt, paidDebt]} />);

    expect(screen.getByText('Seguro do carro')).toBeInTheDocument();
    expect(screen.getByText('IPVA')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    expect(screen.getByText('Paga')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 300,00')).toHaveLength(2);
  });

  it('should show a distinct label for installment and recurring debts', () => {
    render(
      <DebtList
        debts={[
          { ...pendingDebt, id: 'installment-debt-id', type: 'INSTALLMENT' },
          { ...pendingDebt, id: 'recurring-debt-id', type: 'RECURRING' },
        ]}
      />,
    );

    expect(screen.getByText('Parcelada')).toBeInTheDocument();
    expect(screen.getByText('Recorrente')).toBeInTheDocument();
  });

  it('should sort pending debts first and newest paid debts first', () => {
    render(
      <DebtList
        debts={[
          {
            ...paidDebt,
            id: 'older-paid-debt-id',
            description: 'cartão antigo',
            paidAt: '2026-05-27T00:00:00.000Z',
            updatedAt: '2026-05-27T10:00:00.000Z',
          },
          {
            ...pendingDebt,
            description: 'IPVA pendente',
            dueDate: '2026-06-03T00:00:00.000Z',
          },
          {
            ...paidDebt,
            id: 'newer-paid-debt-id',
            description: 'cartão novo',
            paidAt: '2026-05-27T00:00:00.000Z',
            updatedAt: '2026-05-27T12:00:00.000Z',
          },
        ]}
      />,
    );

    expect(
      screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(['IPVA pendente', 'cartão novo', 'cartão antigo']);
  });

  it('should show manage actions only for pending debts', async () => {
    const user = userEvent.setup();
    const onEditDebt = jest.fn();
    const onDeleteDebt = jest.fn();

    render(
      <DebtList
        debts={[pendingDebt, paidDebt]}
        onEditDebt={onEditDebt}
        onDeleteDebt={onDeleteDebt}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Editar' }));
    await user.click(screen.getByRole('button', { name: 'Excluir' }));

    expect(onEditDebt).toHaveBeenCalledWith(pendingDebt);
    expect(onDeleteDebt).toHaveBeenCalledWith(pendingDebt);
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('should call pay action for pending debt', async () => {
    const user = userEvent.setup();
    const onPayDebt = jest.fn();

    render(<DebtList debts={[pendingDebt, paidDebt]} onPayDebt={onPayDebt} />);

    await user.click(screen.getByRole('button', { name: 'Pagar' }));

    expect(onPayDebt).toHaveBeenCalledWith(pendingDebt);
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should render empty state', () => {
    render(<DebtList debts={[]} />);

    expect(screen.getByText('Nenhuma dívida encontrada')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Cadastre uma nova dívida ou ajuste a visualização para acompanhar compromissos pendentes e pagos.',
      ),
    ).toBeInTheDocument();
  });
});
