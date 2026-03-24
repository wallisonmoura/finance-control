import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { DeleteIncomeUseCase } from '@/modules/finance/domain/application/use-cases/delete-income.use-case';

describe('DeleteIncomeUseCase', () => {
  it('Deve excluir um ganho com sucesso', async () => {
    const repository = new InMemoryFinancialEntryRepository([
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

    const useCase = new DeleteIncomeUseCase(repository);

    await useCase.execute({
      id: 'income-1',
      userId: 'user-1',
    });

    const found = await repository.findById('income-1');

    expect(found).toBeNull();
  });
});
