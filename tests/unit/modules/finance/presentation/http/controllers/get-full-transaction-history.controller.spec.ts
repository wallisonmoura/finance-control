import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { FULL_PERIOD_PAGE_SIZE } from '@/modules/finance/constants/finance.constants';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetFullTransactionHistoryController } from '@/modules/finance/presentation/http/controllers/get-full-transaction-history.controller';

const emptyPagination = {
  page: 1,
  pageSize: FULL_PERIOD_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

describe('GetFullTransactionHistoryController', () => {
  let useCase: jest.Mocked<GetTransactionHistoryUseCase>;
  let controller: GetFullTransactionHistoryController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTransactionHistoryUseCase>;

    controller = new GetFullTransactionHistoryController(useCase);
  });

  it('should return status 200 with the full history for the period', async () => {
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
      pagination: {
        page: 1,
        pageSize: FULL_PERIOD_PAGE_SIZE,
        totalCount: 1,
        totalPages: 1,
      },
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

    expect(response.statusCode).toBe(200);
    expect(response.body?.entries).toEqual([
      expect.objectContaining({ id: 'entry-1', date: '2026-04-01' }),
    ]);
  });

  it('should always request page 1 with the full-period page size, regardless of query input', async () => {
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
        // A un-declared page/pageSize on the raw query must never reach the
        // use case — this endpoint's contract has no pagination fields.
        page: '2',
        pageSize: '5',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.page).toBe(1);
    expect(input.pageSize).toBe(FULL_PERIOD_PAGE_SIZE);
  });

  it('should build the use case input from the parsed query', async () => {
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

    expect(input.userId).toBe('user-123');
    expect(input.startDate).toBeInstanceOf(Date);
    expect(input.endDate).toBeInstanceOf(Date);
    expect(input.startDate.toISOString()).toBe('2026-04-01T00:00:00.000Z');
    expect(input.endDate.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(input.type).toBe(FinancialEntryType.EXPENSE);
    expect(input.categoryId).toBe('11111111-1111-4111-8111-111111111111');
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

    expect(input.type).toBeUndefined();
  });

  it('should throw an error when startDate is missing', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          endDate: '2026-04-30',
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
});
