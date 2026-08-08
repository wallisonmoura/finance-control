import { DeleteDebtUseCase } from '@/modules/debts/application/use-cases/delete-debt.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtNotFoundError } from '@/modules/debts/domain/errors/debt-not-found.error';
import { DebtAlreadyPaidError } from '@/modules/debts/domain/errors/debt-already-paid.error';
import { UnauthorizedDebtAccessError } from '@/modules/debts/domain/errors/unauthorized-debt-access.error';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';

describe('DeleteDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: DeleteDebtUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new DeleteDebtUseCase(debtRepository);
  });

  it('should delete a pending debt successfully', async () => {
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
      paymentSource: null,
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

  it('should throw an error when the debt does not exist', async () => {
    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'inexistente',
      }),
    ).rejects.toBeInstanceOf(DebtNotFoundError);
  });

  it('should throw an error when the debt belongs to another user', async () => {
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
      paymentSource: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await debtRepository.create(debt);

    await expect(
      sut.execute({
        userId: 'user-1',
        id: 'debt-1',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedDebtAccessError);
  });

  it('should throw an error when trying to delete a paid debt', async () => {
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
      paymentSource: DebtPaymentSource.CASH,
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
