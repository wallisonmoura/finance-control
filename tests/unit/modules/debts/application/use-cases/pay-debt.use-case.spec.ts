import { PayDebtUseCase } from '@/modules/debts/application/use-cases/pay-debt.use-case';
import { InMemoryDebtPaymentFinancialEffectPort } from './fakes/in-memory-debt-payment-financial-effect.port';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
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

  it('deve pagar uma dívida pendente e registrar os efeitos em finance e wallet', async () => {
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

  it('deve lançar erro quando a dívida não existir', async () => {
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

  it('deve lançar erro quando a dívida pertencer a outro usuário', async () => {
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
    ).rejects.toBeInstanceOf(DebtNotFoundError);
  });

  it('deve lançar erro ao tentar pagar uma dívida já paga', async () => {
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
