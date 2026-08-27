import { PayDebtUseCase } from '@/modules/debts/application/use-cases/pay-debt.use-case';
import { InMemoryDebtPaymentFinancialEffectPort } from './fakes/in-memory-debt-payment-financial-effect.port';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { UnauthorizedDebtAccessError } from '@/modules/debts/domain/errors/unauthorized-debt-access.error';
import { InMemoryDebtPaymentWalletEffectPort } from './fakes/in-memory-debt-payment-wallet-effect.port';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';

describe('PayDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let debtPaymentFinancialEffectPort: InMemoryDebtPaymentFinancialEffectPort;
  let debtPaymentWalletEffectPort: InMemoryDebtPaymentWalletEffectPort;
  let sut: PayDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    debtPaymentFinancialEffectPort =
      new InMemoryDebtPaymentFinancialEffectPort();
    debtPaymentWalletEffectPort = new InMemoryDebtPaymentWalletEffectPort();

    sut = new PayDebtUseCase(
      debtRepository,
      debtPaymentFinancialEffectPort,
      debtPaymentWalletEffectPort,
    );
  });

  it('should pay a pending debt and record the effects in finance and wallet', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Parcela do carro',
      amount: 750,
      dueDate: new Date('2026-04-20'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    const paidAt = new Date('2026-04-18');

    const output = await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      paidAt,
      expenseCategoryId: 'category-1',
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(output.status).toBe(DebtStatus.PAID);
    expect(output.paidAt).toEqual(paidAt);
    expect(output.paymentSource).toBe(DebtPaymentSource.BANK);

    expect(debtPaymentFinancialEffectPort.calls).toHaveLength(1);
    expect(debtPaymentFinancialEffectPort.calls[0]).toEqual({
      debtId: 'debt-1',
      userId: 'user-1',
      amount: 750,
      description: 'Parcela do carro',
      paidAt,
      expenseCategoryId: 'category-1',
    });
    expect(debtPaymentWalletEffectPort.calls).toHaveLength(1);
    expect(debtPaymentWalletEffectPort.calls[0]).toEqual({
      userId: 'user-1',
      amount: 750,
      paymentSource: DebtPaymentSource.BANK,
    });
  });

  it('should throw an error when the debt does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'inexistente',
        paidAt: new Date('2026-04-18'),
        expenseCategoryId: 'category-1',
        paymentSource: DebtPaymentSource.CASH,
      }),
    ).rejects.toBeInstanceOf(DebtNotFoundError);
  });

  it('should throw an error when the debt belongs to another user', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-2',
      description: 'Conta',
      amount: 200,
      dueDate: new Date('2026-04-20'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
        paidAt: new Date('2026-04-18'),
        expenseCategoryId: 'category-1',
        paymentSource: DebtPaymentSource.RECEIVABLE,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedDebtAccessError);
  });

  it('should create the next pending occurrence when paying a RECURRING debt', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Aluguel',
      amount: 1500,
      dueDate: new Date('2026-01-31'),
      type: DebtType.RECURRING,
      status: DebtStatus.PENDING,
      notes: 'Apto 302',
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      paidAt: new Date('2026-01-28'),
      expenseCategoryId: 'category-1',
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(debtRepository.items).toHaveLength(2);

    const nextOccurrence = debtRepository.items.find(
      (item) => item.id !== 'debt-1',
    );

    expect(nextOccurrence).toBeDefined();
    expect(nextOccurrence?.userId).toBe('user-1');
    expect(nextOccurrence?.description).toBe('Aluguel');
    expect(nextOccurrence?.amount).toBe(1500);
    expect(nextOccurrence?.notes).toBe('Apto 302');
    expect(nextOccurrence?.type).toBe(DebtType.RECURRING);
    expect(nextOccurrence?.status).toBe(DebtStatus.PENDING);
    expect(nextOccurrence?.paidAt).toBeNull();
    expect(nextOccurrence?.paymentSource).toBeNull();
    expect(nextOccurrence?.dueDate.toISOString().slice(0, 10)).toBe(
      '2026-02-28',
    );
  });

  it('should not create a next occurrence when paying a ONE_TIME debt', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta única',
      amount: 200,
      dueDate: new Date('2026-04-20'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      paidAt: new Date('2026-04-18'),
      expenseCategoryId: 'category-1',
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(debtRepository.items).toHaveLength(1);
  });

  it('should not create a next occurrence when paying an INSTALLMENT debt', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Parcela 02/04',
      amount: 250,
      dueDate: new Date('2026-04-20'),
      type: DebtType.INSTALLMENT,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      paidAt: new Date('2026-04-18'),
      expenseCategoryId: 'category-1',
      paymentSource: DebtPaymentSource.CASH,
    });

    expect(debtRepository.items).toHaveLength(1);
  });

  it('should throw an error when trying to pay an already paid debt', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta já paga',
      amount: 200,
      dueDate: new Date('2026-04-20'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-04-18'),
      paymentSource: DebtPaymentSource.CASH,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
        paidAt: new Date('2026-04-19'),
        expenseCategoryId: 'category-1',
        paymentSource: DebtPaymentSource.BANK,
      }),
    ).rejects.toBeInstanceOf(DebtAlreadyPaidError);
  });
});
