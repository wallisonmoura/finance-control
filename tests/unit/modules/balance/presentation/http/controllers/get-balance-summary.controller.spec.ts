import { GetBalanceSummaryUseCase } from '@/modules/balance/application/use-cases/get-balance-summary.use-case';
import { GetBalanceSummaryController } from '@/modules/balance/presentation/http/controllers/get-balance-summary.controller';

describe('GetBalanceSummaryController', () => {
  let execute: jest.Mock;
  let useCase: Pick<GetBalanceSummaryUseCase, 'execute'>;
  let controller: GetBalanceSummaryController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new GetBalanceSummaryController(
      useCase as GetBalanceSummaryUseCase,
    );
  });

  it('deve retornar 200 com o balance summary', async () => {
    const output = {
      wallet: {
        bankBalance: 1000,
        cashBalance: 200,
        receivableBalance: 300,
        walletTotal: 1500,
      },
      debts: {
        pendingDebts: 400,
      },
      finalBalance: 1100,
    };

    execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-1',
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('deve propagar erro lançado pelo use case', async () => {
    execute.mockRejectedValue(new Error('Any error'));

    await expect(
      controller.handle({
        userId: 'user-1',
      }),
    ).rejects.toThrow('Any error');
  });
});
