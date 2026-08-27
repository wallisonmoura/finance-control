import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { buildNextRecurringDebt } from '@/modules/debts/domain/services/build-next-recurring-debt';

describe('buildNextRecurringDebt', () => {
  it('should build the next pending occurrence one month after the original due date', () => {
    const paidDebt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Aluguel',
      amount: 1500,
      dueDate: new Date('2026-01-31'),
      type: DebtType.RECURRING,
      status: DebtStatus.PAID,
      notes: 'Apto 302',
      paidAt: new Date('2026-01-28'),
      paymentSource: DebtPaymentSource.BANK,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-28'),
    });

    const now = new Date('2026-01-28T12:00:00.000Z');

    const nextDebt = buildNextRecurringDebt(paidDebt, now);

    expect(nextDebt.id).not.toBe(paidDebt.id);
    expect(nextDebt.userId).toBe('user-1');
    expect(nextDebt.description).toBe('Aluguel');
    expect(nextDebt.amount).toBe(1500);
    expect(nextDebt.notes).toBe('Apto 302');
    expect(nextDebt.type).toBe(DebtType.RECURRING);
    expect(nextDebt.status).toBe(DebtStatus.PENDING);
    expect(nextDebt.paidAt).toBeNull();
    expect(nextDebt.paymentSource).toBeNull();
    expect(nextDebt.dueDate.toISOString().slice(0, 10)).toBe('2026-02-28');
    expect(nextDebt.createdAt).toEqual(now);
    expect(nextDebt.updatedAt).toEqual(now);
  });

  it('should base the next due date on the original due date, not on when it was paid', () => {
    const paidDebt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Internet',
      amount: 120,
      dueDate: new Date('2026-03-05'),
      type: DebtType.RECURRING,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-03-20'),
      paymentSource: DebtPaymentSource.CASH,
      createdAt: new Date('2026-03-01'),
      updatedAt: new Date('2026-03-20'),
    });

    const nextDebt = buildNextRecurringDebt(
      paidDebt,
      new Date('2026-03-20T12:00:00.000Z'),
    );

    expect(nextDebt.dueDate.toISOString().slice(0, 10)).toBe('2026-04-05');
  });
});
