import { PayDebtUseCase } from '@/modules/debts/application/use-cases/pay-debt.use-case';
import { InMemoryDebtPaymentFinancialEffectPort } from './fakes/in-memory-debt-payment-financial-effect.port';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtStatus } from '@/modules/debts/domain/enum/debt-status.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtType } from '@/modules/debts/domain/enum/debt-type.enum';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';

describe('PayDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let debtPaymentFinancialEffectPort: InMemoryDebtPaymentFinancialEffectPort;
  let sut: PayDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    debtPaymentFinancialEffectPort =
      new InMemoryDebtPaymentFinancialEffectPort();

    sut = new PayDebtUseCase(debtRepository, debtPaymentFinancialEffectPort);
  });

  it('deve pagar uma dívida pendente e registrar efeito financeiro', async () => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    const paymentDate = new Date('2026-04-18');

    const output = await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      paymentDate,
    });

    expect(output.status).toBe(DebtStatus.PAID);
    expect(output.paidAt).toEqual(paymentDate);

    expect(debtPaymentFinancialEffectPort.calls).toHaveLength(1);
    expect(debtPaymentFinancialEffectPort.calls[0]).toEqual({
      debtId: 'debt-1',
      userId: 'user-1',
      amount: 750,
      description: 'Parcela do carro',
      paymentDate,
    });
  });

  it('deve lançar erro quando a dívida não existir', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'inexistente',
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
      }),
    ).rejects.toBeInstanceOf(DebtAlreadyPaidError);
  });
});
