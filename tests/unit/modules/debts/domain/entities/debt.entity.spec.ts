import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtStatus } from '@/modules/debts/domain/enum/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enum/debt-type.enum';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { InvalidDebtAmountError } from '@/modules/debts/domain/errors/invalid-debt-amount.error';
import { InvalidDebtDescriptionError } from '@/modules/debts/domain/errors/invalid-debt-description.error';
import { InvalidDebtDueDateError } from '@/modules/debts/domain/errors/invalid-debt-due-date.error';

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
    expect(updatedDebt.updatedAt.getTime()).toBeGreaterThan(
      debt.updatedAt.getTime(),
    );
  });

  it('deve lançar erro ao atualizar uma dívida paga', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
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
    const paymentDate = new Date('2026-04-18');

    const paidDebt = debt.markAsPaid(paymentDate);

    expect(paidDebt.status).toBe(DebtStatus.PAID);
    expect(paidDebt.paidAt).toEqual(paymentDate);
    expect(paidDebt.isPaid()).toBe(true);
    expect(paidDebt.isPending()).toBe(false);
  });

  it('deve usar a data atual ao marcar como paga sem informar paymentDate', () => {
    const debt = Debt.create(baseProps);

    const paidDebt = debt.markAsPaid();

    expect(paidDebt.status).toBe(DebtStatus.PAID);
    expect(paidDebt.paidAt).toBeInstanceOf(Date);
  });

  it('deve lançar erro ao tentar pagar uma dívida já paga', () => {
    const debt = Debt.create({
      ...baseProps,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-04-18'),
    });

    expect(() => debt.markAsPaid()).toThrow(DebtAlreadyPaidError);
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
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T10:00:00.000Z'),
    });
  });
});
