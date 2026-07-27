import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtsDueSoonBell } from '@/modules/debts/presentation/ui/components/debts-due-soon-bell';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debt-ui.types';

function buildIsoDateOffsetFromToday(daysFromToday: number): string {
  const now = new Date();

  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday),
  ).toISOString();
}

function buildDebt(overrides: Partial<DebtUi> = {}): DebtUi {
  return {
    id: 'debt-1',
    userId: 'user-1',
    description: 'Aluguel',
    amount: 1200,
    dueDate: buildIsoDateOffsetFromToday(0),
    type: 'ONE_TIME',
    status: 'PENDING',
    notes: null,
    paidAt: null,
    paymentSource: null,
    createdAt: buildIsoDateOffsetFromToday(-30),
    updatedAt: buildIsoDateOffsetFromToday(-30),
    ...overrides,
  };
}

describe('DebtsDueSoonBell', () => {
  it('should show a badge counting only pending debts due within the next 2 days', () => {
    const debts = [
      buildDebt({ id: 'due-today', dueDate: buildIsoDateOffsetFromToday(0) }),
      buildDebt({ id: 'due-tomorrow', dueDate: buildIsoDateOffsetFromToday(1) }),
      buildDebt({ id: 'due-in-2-days', dueDate: buildIsoDateOffsetFromToday(2) }),
      buildDebt({ id: 'due-in-3-days', dueDate: buildIsoDateOffsetFromToday(3) }),
      buildDebt({ id: 'overdue', dueDate: buildIsoDateOffsetFromToday(-1) }),
      buildDebt({
        id: 'paid-due-tomorrow',
        dueDate: buildIsoDateOffsetFromToday(1),
        status: 'PAID',
        paidAt: buildIsoDateOffsetFromToday(-1),
        paymentSource: 'BANK',
      }),
    ];

    render(<DebtsDueSoonBell initialDebts={debts} />);

    const bellButton = screen.getByRole('button', {
      name: 'Dívidas vencendo em breve',
    });

    expect(within(bellButton).getByText('3')).toBeInTheDocument();
  });

  it('should show no badge when there are no debts due soon', () => {
    const debts = [
      buildDebt({ dueDate: buildIsoDateOffsetFromToday(5) }),
      buildDebt({ dueDate: buildIsoDateOffsetFromToday(-1) }),
    ];

    render(<DebtsDueSoonBell initialDebts={debts} />);

    const bellButton = screen.getByRole('button', {
      name: 'Dívidas vencendo em breve',
    });

    expect(within(bellButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
  });

  it('should list due-soon debts sorted by closest due date first, linking to /debts', async () => {
    const user = userEvent.setup();

    const debts = [
      buildDebt({
        id: 'tomorrow',
        description: 'Conta de luz',
        amount: 250,
        dueDate: buildIsoDateOffsetFromToday(1),
      }),
      buildDebt({
        id: 'today',
        description: 'Aluguel',
        amount: 1200,
        dueDate: buildIsoDateOffsetFromToday(0),
      }),
    ];

    render(<DebtsDueSoonBell initialDebts={debts} />);

    await user.click(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    );

    const items = screen.getAllByRole('link', { name: /Aluguel|Conta de luz/ });

    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Aluguel');
    expect(items[0]).toHaveTextContent('Vence hoje');
    expect(items[1]).toHaveTextContent('Conta de luz');
    expect(items[1]).toHaveTextContent('Vence amanhã');
    expect(items[0]).toHaveAttribute('href', '/debts');
    expect(items[1]).toHaveAttribute('href', '/debts');

    expect(
      screen.getByRole('link', { name: 'Ver todas as dívidas' }),
    ).toHaveAttribute('href', '/debts');
  });

  it('should show an empty state message when opened with no debts due soon', async () => {
    const user = userEvent.setup();

    render(<DebtsDueSoonBell initialDebts={[]} />);

    await user.click(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    );

    expect(
      screen.getByText('Nenhuma dívida vencendo nos próximos dias'),
    ).toBeInTheDocument();
  });

  it('should treat a fetch error as an empty list instead of crashing', () => {
    const debts = [buildDebt({ dueDate: buildIsoDateOffsetFromToday(0) })];

    render(<DebtsDueSoonBell initialDebts={debts} initialError='Erro' />);

    const bellButton = screen.getByRole('button', {
      name: 'Dívidas vencendo em breve',
    });

    expect(within(bellButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
  });
});
