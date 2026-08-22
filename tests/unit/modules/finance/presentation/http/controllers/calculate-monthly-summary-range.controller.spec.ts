import { CalculateMonthlySummaryRangeController } from '@/modules/finance/presentation/http/controllers/calculate-monthly-summary-range.controller';

describe('CalculateMonthlySummaryRangeController', () => {
  it('should call the use case with the parsed months and return 200 with the result', async () => {
    const output = [
      { year: 2026, month: 6, totalIncome: 0, totalExpense: 0, result: 0 },
      { year: 2026, month: 7, totalIncome: 1000, totalExpense: 300, result: 700 },
    ];
    const execute = jest.fn().mockResolvedValue(output);

    const sut = new CalculateMonthlySummaryRangeController({ execute });

    const response = await sut.handle({
      userId: 'user-1',
      query: { months: '2' },
    });

    expect(execute).toHaveBeenCalledWith({ userId: 'user-1', months: 2 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(output);
  });

  it('should default months to 6 when the query omits it', async () => {
    const execute = jest.fn().mockResolvedValue([]);
    const sut = new CalculateMonthlySummaryRangeController({ execute });

    await sut.handle({ userId: 'user-1', query: {} });

    expect(execute).toHaveBeenCalledWith({ userId: 'user-1', months: 6 });
  });
});
