import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { InMemoryFinancialEntryRepository } from './fakes/in-memory-financial-entry.repository';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';

describe('GetTransactionHistoryUseCase', () => {
  it('should return entries from the period sorted by date descending', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 300,
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
        amount: 100,
        description: 'Despesa 1',
        date: new Date('2026-03-22T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      FinancialEntry.create({
        id: 'entry-3',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 150,
        description: 'Venda 2',
        date: new Date('2026-03-21T10:00:00.000Z'),
        categoryId: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetTransactionHistoryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      startDate: new Date('2026-03-20T00:00:00.000Z'),
      endDate: new Date('2026-03-22T23:59:59.999Z'),
      page: 1,
      pageSize: 20,
    });

    expect(output.entries).toHaveLength(3);
    expect(output.entries[0].id).toBe('entry-2');
    expect(output.entries[1].id).toBe('entry-3');
    expect(output.entries[2].id).toBe('entry-1');
    expect(output.totalIncome).toBe(450);
    expect(output.totalExpense).toBe(100);
    expect(output.balance).toBe(350);
  });

  it('should filter by type when informed', async () => {
    const repository = new InMemoryFinancialEntryRepository([
      FinancialEntry.create({
        id: 'entry-1',
        userId: 'user-1',
        type: FinancialEntryType.INCOME,
        amount: 300,
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
        amount: 100,
        description: 'Despesa 1',
        date: new Date('2026-03-21T10:00:00.000Z'),
        categoryId: 'category-1',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);

    const useCase = new GetTransactionHistoryUseCase(repository);

    const output = await useCase.execute({
      userId: 'user-1',
      startDate: new Date('2026-03-20T00:00:00.000Z'),
      endDate: new Date('2026-03-21T23:59:59.999Z'),
      type: FinancialEntryType.EXPENSE,
      page: 1,
      pageSize: 20,
    });

    expect(output.entries).toHaveLength(1);
    expect(output.entries[0].type).toBe(FinancialEntryType.EXPENSE);
    expect(output.totalIncome).toBe(0);
    expect(output.totalExpense).toBe(100);
    expect(output.balance).toBe(-100);
  });

  it('should filter by category when categoryId is informed', async () => {
    const repository = new InMemoryFinancialEntryRepository();
    const useCase = new GetTransactionHistoryUseCase(repository);

    const userId = 'user-1';
    const categoryId = '11111111-1111-4111-8111-111111111111';
    const otherCategoryId = '22222222-2222-4222-8222-222222222222';

    await repository.create(
      FinancialEntry.create({
        id: 'entry-1',
        userId,
        type: FinancialEntryType.EXPENSE,
        amount: 100,
        description: 'Gasolina',
        date: new Date('2026-04-10T00:00:00.000Z'),
        categoryId,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    await repository.create(
      FinancialEntry.create({
        id: 'entry-2',
        userId,
        type: FinancialEntryType.EXPENSE,
        amount: 50,
        description: 'Mercado',
        date: new Date('2026-04-11T00:00:00.000Z'),
        categoryId: otherCategoryId,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute({
      userId,
      startDate: new Date('2026-04-01T00:00:00.000Z'),
      endDate: new Date('2026-04-30T00:00:00.000Z'),
      type: FinancialEntryType.EXPENSE,
      categoryId,
      page: 1,
      pageSize: 20,
    });

    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].description).toBe('Gasolina');
    expect(result.totalExpense).toBe(100);
  });

  describe('pagination', () => {
    function makeEntries(count: number): FinancialEntry[] {
      return Array.from({ length: count }, (_, index) =>
        FinancialEntry.create({
          id: `entry-${index + 1}`,
          userId: 'user-1',
          type: FinancialEntryType.INCOME,
          amount: 10,
          description: `Entry ${index + 1}`,
          // dia crescente: entry-1 é o mais antigo, entry-N o mais recente.
          date: new Date(2026, 3, index + 1),
          categoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      );
    }

    it('should return only the requested page of entries', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(25),
      );
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 1,
        pageSize: 20,
      });

      expect(output.entries).toHaveLength(20);
      // Ordenação desc por data: entry-25 (mais recente) é o primeiro da página 1.
      expect(output.entries[0].id).toBe('entry-25');
      expect(output.entries[19].id).toBe('entry-6');
    });

    it('should return the remaining entries on the second page', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(25),
      );
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 2,
        pageSize: 20,
      });

      expect(output.entries).toHaveLength(5);
      expect(output.entries[0].id).toBe('entry-5');
      expect(output.entries[4].id).toBe('entry-1');
    });

    it('should return pagination metadata reflecting the full period, not just the page', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(25),
      );
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 1,
        pageSize: 20,
      });

      expect(output.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalCount: 25,
        totalPages: 2,
      });
    });

    it('should compute totals over the full period, not just the returned page', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(25),
      );
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 1,
        pageSize: 20,
      });

      expect(output.totalIncome).toBe(250);
    });

    it('should return an empty page with totalPages 0 when there are no entries in the period', async () => {
      const repository = new InMemoryFinancialEntryRepository();
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 1,
        pageSize: 20,
      });

      expect(output.entries).toHaveLength(0);
      expect(output.pagination).toEqual({
        page: 1,
        pageSize: 20,
        totalCount: 0,
        totalPages: 0,
      });
    });

    it('should return an empty page when requesting a page beyond available data', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(5),
      );
      const useCase = new GetTransactionHistoryUseCase(repository);

      const output = await useCase.execute({
        userId: 'user-1',
        startDate: new Date(2026, 3, 1),
        endDate: new Date(2026, 3, 30),
        page: 3,
        pageSize: 20,
      });

      expect(output.entries).toHaveLength(0);
      expect(output.pagination).toEqual({
        page: 3,
        pageSize: 20,
        totalCount: 5,
        totalPages: 1,
      });
    });

    it('should query totals and the paginated page in parallel with the same filters', async () => {
      const repository = new InMemoryFinancialEntryRepository(
        makeEntries(3),
      );
      const totalsSpy = jest.spyOn(repository, 'getPeriodTotals');
      const paginatedSpy = jest.spyOn(
        repository,
        'findByUserIdAndPeriodPaginated',
      );

      const useCase = new GetTransactionHistoryUseCase(repository);

      const startDate = new Date(2026, 3, 1);
      const endDate = new Date(2026, 3, 30);

      await useCase.execute({
        userId: 'user-1',
        startDate,
        endDate,
        type: FinancialEntryType.INCOME,
        categoryId: undefined,
        page: 2,
        pageSize: 10,
      });

      expect(totalsSpy).toHaveBeenCalledWith(
        'user-1',
        startDate,
        endDate,
        FinancialEntryType.INCOME,
        undefined,
      );
      expect(paginatedSpy).toHaveBeenCalledWith(
        'user-1',
        startDate,
        endDate,
        FinancialEntryType.INCOME,
        undefined,
        { skip: 10, take: 10 },
      );
    });
  });
});
