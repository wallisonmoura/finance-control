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

  it('deve criar uma dívida válida com sucesso', () => {
    const debt = Debt.create(baseProps);

    expect(debt.id).toBe('debt-1');
    expect(debt.userId).toBe('user-1');
    expect(debt.description).toBe('Parcela do carro');
    expect(debt.amount).toBe(850);
    expect(debt.dueDate).toEqual(new Date('2026-04-20'));
    expect(debt.type).toBe(DebtType.ONE_TIME);
    expect(debt.status).toBe(DebtStatus.PENDING);
    expect(debt.notes).toBeNull();
    expect(debt.paidAt).toBeNull();
    expect(debt.paymentSource).toBeNull();
  });

  it('deve lançar erro quando a descrição estiver vazia', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        description: '',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('deve lançar erro quando a descrição tiver apenas espaços', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        description: '   ',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('deve lançar erro quando o valor for zero', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        amount: 0,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('deve lançar erro quando o valor for negativo', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        amount: -10,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('deve lançar erro quando a dueDate for inválida', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        dueDate: new Date('data-invalida'),
      }),
    ).toThrow(InvalidDebtDueDateError);
  });

  it('deve lançar erro quando uma dívida pendente possuir paidAt', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        paidAt: new Date('2026-04-18'),
      }),
    ).toThrow(InvalidDebtPendingStateError);
  });

  it('deve lançar erro quando uma dívida pendente possuir paymentSource', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).toThrow(InvalidDebtPendingStateError);
  });

  it('deve lançar erro quando uma dívida paga não possuir paidAt', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        status: DebtStatus.PAID,
        paidAt: null,
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).toThrow(InvalidDebtPaidStateError);
  });

  it('deve lançar erro quando uma dívida paga não possuir paymentSource', () => {
    expect(() =>
      Debt.create({
        ...baseProps,
        status: DebtStatus.PAID,
        paidAt: new Date('2026-04-18'),
        paymentSource: null,
      }),
    ).toThrow(InvalidDebtPaidStateError);
  });

  it('deve retornar true para isPending quando a dívida estiver pendente', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PENDING,
    });

    expect(debt.isPending()).toBe(true);
    expect(debt.isPaid()).toBe(false);
  });

  it('deve retornar true para isPaid quando a dívida estiver paga', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(debt.isPaid()).toBe(true);
    expect(debt.isPending()).toBe(false);
  });

  it('deve atualizar uma dívida pendente com sucesso', () => {
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

  it('deve lançar erro ao atualizar uma dívida paga', () => {
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

  it('deve lançar erro ao atualizar com descrição inválida', () => {
    const debt = Debt.create(baseProps);

    expect(() =>
      debt.update({
        description: '   ',
      }),
    ).toThrow(InvalidDebtDescriptionError);
  });

  it('deve lançar erro ao atualizar com valor inválido', () => {
    const debt = Debt.create(baseProps);

    expect(() =>
      debt.update({
        amount: 0,
      }),
    ).toThrow(InvalidDebtAmountError);
  });

  it('deve marcar uma dívida pendente como paga', () => {
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

  it('deve lançar erro ao tentar pagar uma dívida já paga', () => {
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

  it('deve retornar os dados corretamente no toJSON', () => {
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
});
