import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetAvailableBalanceUseCase } from '@/modules/finance/domain/application/use-cases/get-available-balance.use-case';

describe('GetAvailableBalanceUseCase', () => {
  it('deve calcular o saldo disponível do usuário', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 1000,
        description: 'Venda 1',
        date: new Date('2026-03-20T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-2',
        userId: 'user-1',
        type: FinancialEntryType.EXPENSE,
        amount: 300,
        description: 'Despesa 1',
        date: new Date('2026-03-21T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-3',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 200,
        description: 'Venda 2',
        date: new Date('2026-03-22T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetAvailableBalanceUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
    });

    expect(output.totalIncome).toBe(1200);
    expect(output.totalExpense).toBe(300);
    expect(output.balance).toBe(900);
  });

  it('deve retornar zero quando o usuário não possuir lançamentos', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new GetAvailableBalanceUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
    });

    expect(output.totalIncome).toBe(0);
    expect(output.totalExpense).toBe(0);
    expect(output.balance).toBe(0);
  });
});
