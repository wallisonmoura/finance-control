import { DeleteDebtUseCase } from '@/modules/debts/application/use-cases/delete-debt.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtType } from '@/modules/debts/domain/enum/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enum/debt-status.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';

describe('DeleteDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: DeleteDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new DeleteDebtUseCase(debtRepository);
  });

  it('deve excluir uma dívida pendente com sucesso', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta para excluir',
      amount: 90,
      dueDate: new Date('2026-04-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await sut.execute({
      userId: 'user-1',
      id: 'debt-1',
    });

    expect(debtRepository.items).toHaveLength(0);
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
      amount: 90,
      dueDate: new Date('2026-04-10'),
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

  it('deve lançar erro ao tentar excluir uma dívida paga', async () => {
    const debt = Debt.create({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Conta paga',
      amount: 90,
      dueDate: new Date('2026-04-10'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-04-09'),
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
