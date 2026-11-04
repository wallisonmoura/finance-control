import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetRecentTransactionsUseCase } from '@/modules/finance/application/use-cases/get-recent-transactions.use-case';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';

function entry(id: string, userId: string, date: string): FinancialEntry {
  return FinancialEntry.create({
    id,
    userId,
    type: FinancialEntryType.INCOME,
    amount: 100,
    description: `Lançamento ${id}`,
    date: new Date(`${date}T00:00:00.000Z`),
    categoryId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

describe('GetRecentTransactionsUseCase', () => {
  it("should return the user's newest entries from any month, up to the limit", async () => {
    const repository = new InMemoryFinancialEntryRepository([
      entry('aug', 'user-1', '2026-08-20'),
      entry('oct', 'user-1', '2026-10-31'),
      entry('sep', 'user-1', '2026-09-15'),
      entry('jul', 'user-1', '2026-07-01'),
      entry('other', 'user-2', '2026-11-01'),
    ]);

    const result = await new GetRecentTransactionsUseCase(repository).execute({
      userId: 'user-1',
      limit: 3,
    });

    expect(result.map((item) => item.id)).toEqual(['oct', 'sep', 'aug']);
  });
});
