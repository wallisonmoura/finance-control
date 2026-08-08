import { ListDebtsUseCase } from '@/modules/debts/application/use-cases/list-debts.use-case';
import { InMemoryDebtRepository } from './fakes/in-memory-debt.repository';
import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';

describe('ListDebtUseCase', () => {
  let debtRepository: InMemoryDebtRepository;
  let sut: ListDebtsUseCase;

  beforeEach(() => {
    debtRepository = new InMemoryDebtRepository();
    sut = new ListDebtsUseCase(debtRepository);
  });

  it('should list only the user debts ordered by due date', async () => {
    await debtRepository.create(
      Debt.create({
        id: 'debt-1',
        userId: 'user-1',
        description: 'Mais tarde',
        amount: 200,
        dueDate: new Date('2026-04-20'),
        type: DebtType.ONE_TIME,
        status: DebtStatus.PENDING,
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await debtRepository.create(
      Debt.create({
        id: 'debt-2',
        userId: 'user-1',
        description: 'Mais cedo',
        amount: 100,
        dueDate: new Date('2026-04-10'),
        type: DebtType.RECURRING,
        status: DebtStatus.PENDING,
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    await debtRepository.create(
      Debt.create({
        id: 'debt-3',
        userId: 'user-2',
        description: 'Outro usuário',
        amount: 300,
        dueDate: new Date('2026-04-05'),
        type: DebtType.ONE_TIME,
        status: DebtStatus.PENDING,
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const output = await sut.execute({ userId: 'user-1' });

    expect(output).toHaveLength(2);
    expect(output[0].id).toBe('debt-2');
    expect(output[1].id).toBe('debt-1');
  });

  it('should return an empty array when there are no debts', async () => {
    const output = await sut.execute({ userId: 'user-1' });

    expect(output).toEqual([]);
  });
});
