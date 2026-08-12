import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtsDueSoonBell } from '@/modules/debts/presentation/ui/components/debts-due-soon-bell';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

function buildIsoDateOffsetFromToday(daysFromToday: number): string {
  const now = new Date();

  return new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday),
  ).toISOString();
}

/**
 * Simula um processo cujos getters locais de Date leem como se estivessem
 * em UTC (o pior caso: SSR em produção, já que este componente roda dentro
 * de um Server Component antes de hidratar no navegador).
 */
function mockDateGettersAsIfUtc(
  year: number,
  monthIndex: number,
  day: number,
): void {
  jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(year);
  jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(monthIndex);
  jest.spyOn(Date.prototype, 'getDate').mockReturnValue(day);
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
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

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

  it('should not count a debt due in 3 business days as due soon during the SSR UTC-offset window', () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08) —
    // reproduz o SSR em produção na janela em que o servidor (UTC) já
    // pensa ser o dia seguinte, antes da hidratação corrigir no navegador.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T22:38:00-03:00'));
    mockDateGettersAsIfUtc(2026, 7, 1); // "01/08" (agosto, 0-based)

    const debts = [
      buildDebt({ id: 'due-in-3-business-days', dueDate: '2026-08-03' }),
    ];

    render(<DebtsDueSoonBell initialDebts={debts} />);

    const bellButton = screen.getByRole('button', {
      name: 'Dívidas vencendo em breve',
    });

    expect(within(bellButton).queryByText(/^\d+$/)).not.toBeInTheDocument();
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

  it('should close the dropdown after clicking a debt to navigate to /debts', async () => {
    const user = userEvent.setup();

    const debts = [
      buildDebt({ description: 'Aluguel', dueDate: buildIsoDateOffsetFromToday(0) }),
    ];

    render(<DebtsDueSoonBell initialDebts={debts} />);

    await user.click(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    );

    await user.click(screen.getByRole('link', { name: /Aluguel/ }));

    expect(screen.queryByText('Vencendo em breve')).not.toBeInTheDocument();
  });

  it('should close the dropdown after clicking "Ver todas as dívidas"', async () => {
    const user = userEvent.setup();

    render(<DebtsDueSoonBell initialDebts={[]} />);

    await user.click(
      screen.getByRole('button', { name: 'Dívidas vencendo em breve' }),
    );

    await user.click(
      screen.getByRole('link', { name: 'Ver todas as dívidas' }),
    );

    expect(screen.queryByText('Vencendo em breve')).not.toBeInTheDocument();
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
