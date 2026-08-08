import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { InvalidDebtAmountError } from '@/modules/debts/domain/errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '@/modules/debts/domain/errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '@/modules/debts/domain/errors/invalid-debt-due-date.error';
import { InvalidDebtPaidStateError } from '@/modules/debts/domain/errors/invalid-debt-paid-state.error';
import { InvalidDebtPendingStateError } from '@/modules/debts/domain/errors/invalid-debt-pending-state.error';

describe('Debt entity', () => {
  const baseProps = {
    id: 'debt-1',
    userId: 'user-1',
    description: 'Parcela do carro',
    amount: 850,
    dueDate: new Date('2026-04-20'),
    type: DebtType.ONE_TIME,
    status: DebtStatus.PENDING,
    notes: null,
    paidAt: null,
    paymentSource: null,
    createdAt: new Date('2026-04-01T10:00:00.000Z'),
    updatedAt: new Date('2026-04-01T10:00:00.000Z'),
  };

  it('should create a valid debt successfully', () => {
    const debt = Debt.create(baseProps);

    expect(debt.id).toBe(baseProps.id);
    expect(debt.userId).toBe(baseProps.userId);
    expect(debt.description).toBe(baseProps.description);
    expect(debt.amount).toBe(baseProps.amount);
    expect(debt.dueDate).toEqual(baseProps.dueDate);
    expect(debt.type).toBe(baseProps.type);
    expect(debt.status).toBe(baseProps.status);
    expect(debt.notes).toBe(baseProps.notes);
    expect(debt.paidAt).toBeNull();
    expect(debt.paymentSource).toBeNull();
    expect(debt.createdAt).toEqual(baseProps.createdAt);
    expect(debt.updatedAt).toEqual(baseProps.updatedAt);
  });

  it('should throw an error when the description is empty', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        description: '',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('should throw an error when the description contains only spaces', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        description: '   ',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('should throw an error when the amount is zero', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        amount: 0,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('should throw an error when the amount is negative', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        amount: -10,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('should throw an error when the amount is not a finite number', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        amount: Number.NaN,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('should throw an error when the dueDate is invalid', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        dueDate: new Date('data-invalida'),
      }),
    ).toThrow(InvalidDebtDueDateError);
  });

  it('should throw an error when a pending debt has paidAt', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        paidAt: new Date('2026-04-18'),
      }),
    ).toThrow(InvalidDebtPendingStateError);
  });

  it('should throw an error when a pending debt has paymentSource', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).toThrow(InvalidDebtPendingStateError);
  });

  it('should throw an error when a paid debt has no paidAt', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        status: DebtStatus.PAID,
        paidAt: null,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).toThrow(InvalidDebtPaidStateError);
  });

  it('should throw an error when a paid debt has no paymentSource', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        status: DebtStatus.PAID,
        paidAt: new Date('2026-04-18'),
        paymentSource: null,
      }),
    ).toThrow(InvalidDebtPaidStateError);
  });

  it('should return true for isPending when the debt is pending', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PENDING,
    });

    expect(debt.isPending()).toBe(true);
    expect(debt.isPaid()).toBe(false);
  });

  it('should return true for isPaid when the debt is paid', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(debt.isPaid()).toBe(true);
    expect(debt.isPending()).toBe(false);
  });

  it('should update a pending debt successfully', () => {
    const debt = Debt.create(baseProps);

    const updatedDebt = debt.update({
      description: 'Parcela atualizada',
      amount: 900,
      dueDate: new Date('2026-04-25'),
      type: DebtType.RECURRING,
      notes: 'Ajustada',
    });

    expect(updatedDebt.description).toBe('Parcela atualizada');
    expect(updatedDebt.amount).toBe(900);
    expect(updatedDebt.dueDate).toEqual(new Date('2026-04-25'));
    expect(updatedDebt.type).toBe(DebtType.RECURRING);
    expect(updatedDebt.notes).toBe('Ajustada');
    expect(updatedDebt.status).toBe(DebtStatus.PENDING);
    expect(updatedDebt.paidAt).toBeNull();
    expect(updatedDebt.paymentSource).toBeNull();
    expect(updatedDebt.updatedAt.getTime()).toBeGreaterThan(
      debt.updatedAt.getTime(),
    );
  });

  it('should throw an error when updating a paid debt', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(() =>
      debt.update({
        description: 'Tentativa inválida',
      }),
    ).toThrow(DebtAlreadyPaidError);
  });

  it('should throw an error when updating with an invalid description', () => {
    const debt = Debt.create(baseProps);

    expect(() =>
      debt.update({
        description: '   ',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('should throw an error when updating with an invalid amount', () => {
    const debt = Debt.create(baseProps);

    expect(() =>
      debt.update({
        amount: 0,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('should mark a pending debt as paid', () => {
    const debt = Debt.create(baseProps);
    const paidAt = new Date('2026-04-18');

    const paidDebt = debt.markAsPaid({
      paidAt,
      paymentSource: DebtPaymentSource.RECEIVABLE,
    });

    expect(paidDebt.status).toBe(DebtStatus.PAID);
    expect(paidDebt.paidAt).toEqual(paidAt);
    expect(paidDebt.paymentSource).toBe(DebtPaymentSource.RECEIVABLE);
    expect(paidDebt.isPaid()).toBe(true);
    expect(paidDebt.isPending()).toBe(false);
  });

  it('should throw an error when trying to pay an already paid debt', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(() =>
      debt.markAsPaid({
        paidAt: new Date('2026-04-19'),
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).toThrow(DebtAlreadyPaidError);
  });

  it('should return the correct data in toJSON', () => {
    const debt = Debt.create(baseProps);

    expect(debt.toJSON()).toEqual({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Parcela do carro',
      amount: 850,
      dueDate: new Date('2026-04-20'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T10:00:00.000Z'),
    });
  });

  it('should fail to create a debt without userId', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        userId: '',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should fail to create a debt with userId containing only spaces', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        userId: '   ',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });
});
