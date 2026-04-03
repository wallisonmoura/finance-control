import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import { FinancialEntryNotFoundError } from '@/modules/finance/domain/errors/financial-entry-not-found.error';
import { UnauthorizedFinancialEntryAccessError } from '@/modules/finance/domain/errors/unauthorized-financial-entry-access.error';

describe('UpdateIncomeUseCase', () => {
  it('Deve atualizar um ganho com sucesso', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'income-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 100,
        description: 'Venda',
        date: new Date('2026-03-23'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    const output = await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
      amount: 180,
      description: 'Venda atualizada',
      date: new Date('2026-03-24'),
      notes: 'ajuste',
    });

    expect(output.amount).toBe(180);
    expect(output.description).toBe('Venda atualizada');
    expect(output.type).toBe(FinancialEntryType.INCOME);
    expect(output.categoryId).toBeNull();
  });

  it('deve falhar se o ganho não existir', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository();
    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: 'Venda atualizada',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(FinancialEntryNotFoundError);
  });

  it('deve falhar se o ganho pertencer a outro usuário', async () => {
    const financialEntryRepository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'income-1',
        userId: 'user-2',
        type: FinancialEntryType.INCOME,
        amount: 100,
        description: 'Venda',
        date: new Date('2026-03-23'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new UpdateIncomeUseCase(financialEntryRepository);

    await expect(
      useCase.execute({
        id: 'income-1',
        userId: 'user-1',
        amount: 180,
        description: 'Venda atualizada',
        date: new Date('2026-03-24'),
      }),
    ).rejects.toThrow(UnauthorizedFinancialEntryAccessError);
  });
});
