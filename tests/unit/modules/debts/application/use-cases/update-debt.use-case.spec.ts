import { UpdateDebtUseCase } from '@/modules/debts/application/use-cases/update-debt.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';

describe('UpdateDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: UpdateDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new UpdateDebtUseCase(debtRepository);
  });

  it('deve atualizar uma dívida pendente com sucesso', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta antiga',
      amount: 100,
      dueDate: new Date('2026-04-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    const output = await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
      description: 'Conta atualizada',
      amount: 150,
      dueDate: new Date('2026-04-15'),
      notes: 'Ajuste',
    });

    expect(output.description).toBe('Conta atualizada');
    expect(output.amount).toBe(150);
    expect(output.notes).toBe('Ajuste');
    expect(output.paymentSource).toBeNull();
  });

  it('deve lançar erro quando a dívida não existir', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'inexistente',
        description: 'Nova descrição',
      }),
    ).rejects.toBeInstanceOf(DebtNotFoundError);
  });

  it('deve lançar erro quando a dívida pertencer a outro usuário', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-2',
      description: 'Conta',
      amount: 100,
      dueDate: new Date('2026-04-10'),
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
        description: 'Tentativa inválida',
      }),
    ).rejects.toBeInstanceOf(DebtNotFoundError);
  });

  it('deve lançar erro ao tentar atualizar uma dívida paga', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta paga',
      amount: 100,
      dueDate: new Date('2026-04-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-04-09'),
      paymentSource: DebtPaymentSource.BANK,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
        description: 'Editar paga',
      }),
    ).rejects.toBeInstanceOf(DebtAlreadyPaidError);
  });
});
