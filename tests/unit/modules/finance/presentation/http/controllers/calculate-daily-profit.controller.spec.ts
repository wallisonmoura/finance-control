import { DailyProfitOutput } from '@/modules/finance/application/dtos/daily-profit.output';
import { CalculateDailyProfitUseCase } from '@/modules/finance/application/use-cases/calculate-daily-profit.use-case';
import { CalculateDailyProfitController } from '@/modules/finance/presentation/http/controllers/calculate-daily-profit.controller';

describe('CalculateDailyProfitController', () => {
  let useCase: jest.Mocked<CalculateDailyProfitUseCase>;
  let controller: CalculateDailyProfitController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateDailyProfitUseCase>;

    controller = new CalculateDailyProfitController(useCase);
  });

  it('should return status 200 with the daily profit', async () => {
    const output: DailyProfitOutput = {
      date: new Date(2026, 3, 6),
      totalIncome: 300,
      totalExpense: 120,
      profit: 180,
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

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
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
