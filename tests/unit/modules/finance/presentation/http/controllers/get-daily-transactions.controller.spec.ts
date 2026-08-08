import { DailyTransactionsOutput } from '@/modules/finance/application/dtos/daily-transactions.output';
import { GetDailyTransactionsUseCase } from '@/modules/finance/application/use-cases/get-daily-transactions.use-case';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetDailyTransactionsController } from '@/modules/finance/presentation/http/controllers/get-daily-transactions.controller';

describe('GetDailyTransactionsController', () => {
  let useCase: jest.Mocked<GetDailyTransactionsUseCase>;
  let controller: GetDailyTransactionsController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetDailyTransactionsUseCase>;

    controller = new GetDailyTransactionsController(useCase);
  });

  it('should return status 200 with the entries of the day', async () => {
    const output: DailyTransactionsOutput = {
      date: new Date(2026, 3, 6),
      entries: [
        {
          id: 'entry-1',
          userId: 'user-123',
          type: FinancialEntryType.INCOME,
          amount: 200,
          description: 'Corrida Uber',
          date: new Date(2026, 3, 6),
          categoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'entry-2',
          userId: 'user-123',
          type: FinancialEntryType.EXPENSE,
          amount: 50,
          description: 'Combustível',
          date: new Date(2026, 3, 6),
          categoryId: 'cat-1',
          notes: 'Posto X',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalIncome: 200,
      totalExpense: 50,
      dailyProfit: 150,
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-123',
      query: {
        date: '2026-04-06',
      },
    });

    expect(useCase.execute).toHaveBeenCalledTimes(1);

    const input = useCase.execute.mock.calls[0][0];

    expect(input.userId).toBe('user-123');
    expect(input.date).toBeInstanceOf(Date);
    expect(input.date.toISOString()).toBe('2026-04-06T00:00:00.000Z');

    expect(response.statusCode).toBe(200);
    expect(response.body?.entries).toEqual([
      expect.objectContaining({ id: 'entry-1', date: '2026-04-06' }),
      expect.objectContaining({ id: 'entry-2', date: '2026-04-06' }),
    ]);
  });

  it('should throw an error when the date is missing', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {},
      }),
    ).rejects.toThrow();
  });

  it('should throw an error when the date is in an invalid format', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          date: '06-04-2026',
        },
      }),
    ).rejects.toThrow();
  });
});
