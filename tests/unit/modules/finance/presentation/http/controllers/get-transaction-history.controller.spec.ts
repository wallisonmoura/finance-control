import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetTransactionHistoryController } from '@/modules/finance/presentation/http/controllers/get-transaction-history.controller';

const emptyPagination = {
  page: 1,
  pageSize: 20,
  totalCount: 0,
  totalPages: 0,
};

describe('GetTransactionHistoryController', () => {
  let useCase: jest.Mocked<GetTransactionHistoryUseCase>;
  let controller: GetTransactionHistoryController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTransactionHistoryUseCase>;

    controller = new GetTransactionHistoryController(useCase);
  });

  it('should return status 200 with history filtered by period and type', async () => {
    const output: TransactionHistoryOutput = {
      entries: [
        {
          id: 'entry-1',
          userId: 'user-123',
          type: FinancialEntryType.INCOME,
          amount: 200,
          description: 'Corrida Uber',
          date: new Date(2026, 3, 1),
          categoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalIncome: 200,
      totalExpense: 0,
      balance: 200,
      pagination: { page: 1, pageSize: 20, totalCount: 1, totalPages: 1 },
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        type: FinancialEntryType.INCOME,
      },
    });

    expect(useCase.execute).toHaveBeenCalledTimes(1);

    const input = useCase.execute.mock.calls[0][0];

    expect(input.userId).toBe('user-123');
    expect(input.startDate).toBeInstanceOf(Date);
    expect(input.endDate).toBeInstanceOf(Date);

    expect(input.startDate.toISOString()).toBe('2026-04-01T00:00:00.000Z');

    expect(input.endDate.toISOString()).toBe('2026-05-01T00:00:00.000Z');

    expect(input.type).toBe(FinancialEntryType.INCOME);

    expect(response.statusCode).toBe(200);
    expect(response.body?.entries).toEqual([
      expect.objectContaining({ id: 'entry-1', date: '2026-04-01' }),
    ]);
    expect(response.body?.pagination).toEqual({
      page: 1,
      pageSize: 20,
      totalCount: 1,
      totalPages: 1,
    });
  });

  it('should return status 200 when the type is not informed', async () => {
    const output: TransactionHistoryOutput = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: emptyPagination,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.userId).toBe('user-123');
    expect(input.type).toBeUndefined();
  });

  it('should throw an error when startDate is missing', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          endDate: '2026-04-30',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('should throw an error when endDate is missing', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-01',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('should throw an error when startDate is greater than endDate', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-30',
          endDate: '2026-04-01',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('should throw an error when the type is invalid', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          type: 'INVALID_TYPE',
        },
      }),
    ).rejects.toThrow();
  });

  it('should forward categoryId to the use case', async () => {
    const output: TransactionHistoryOutput = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: emptyPagination,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        type: FinancialEntryType.EXPENSE,
        categoryId: '11111111-1111-4111-8111-111111111111',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.categoryId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('should default page to 1 and pageSize to 20 when not informed', async () => {
    const output: TransactionHistoryOutput = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: emptyPagination,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.page).toBe(1);
    expect(input.pageSize).toBe(20);
  });

  it('should forward page and pageSize to the use case', async () => {
    const output: TransactionHistoryOutput = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      pagination: emptyPagination,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        page: '2',
        pageSize: '10',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.page).toBe(2);
    expect(input.pageSize).toBe(10);
  });

  it('should throw an error when pageSize exceeds the upper bound', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          pageSize: '101',
        },
      }),
    ).rejects.toThrow();
  });
});
