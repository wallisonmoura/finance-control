import { CalculateMonthlySummaryInput } from '@/modules/finance/application/dtos/calculate-monthly-summary.input';
import { MonthlySummaryOutput } from '@/modules/finance/application/dtos/monthly-summary.output';
import { CalculateMonthlySummaryUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary.use-case';
import { CalculateMonthlySummaryController } from '@/modules/finance/presentation/http/controllers/calculate-monthly-summary.controller';

describe('CalculateMonthlySummaryController', () => {
  let useCase: jest.Mocked<CalculateMonthlySummaryUseCase>;
  let controller: CalculateMonthlySummaryController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<CalculateMonthlySummaryUseCase>;

    controller = new CalculateMonthlySummaryController(useCase);
  });

  it('deve retornar status 200 com o resumo mensal', async () => {
    const output: MonthlySummaryOutput = {
      month: 4,
      year: 2026,
      totalIncome: 2500,
      totalExpense: 900,
      result: 1600,
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-123',
      query: {
        year: '2026',
        month: '4',
      },
    });

    const expectedInput: CalculateMonthlySummaryInput = {
      userId: 'user-123',
      year: 2026,
      month: 4,
    };

    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('deve aceitar mês com zero à esquerda', async () => {
    const output: MonthlySummaryOutput = {
      month: 4,
      year: 2026,
      totalIncome: 1000,
      totalExpense: 400,
      result: 600,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        year: '2026',
        month: '04',
      },
    });

    expect(useCase.execute).toHaveBeenCalledWith({
      userId: 'user-123',
      year: 2026,
      month: 4,
    });
  });

  it('deve lançar erro quando o mês for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          year: '2026',
          month: '13',
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando o ano for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          year: '26',
          month: '4',
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando faltar o mês', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          year: '2026',
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando faltar o ano', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          month: '4',
        },
      }),
    ).rejects.toThrow();
  });
});
