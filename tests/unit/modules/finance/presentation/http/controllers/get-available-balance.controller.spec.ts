import { AvailableBalanceOutput } from '@/modules/finance/application/dtos/available-balance.output';
import { GetAvailableBalanceInput } from '@/modules/finance/application/dtos/get-available-balance.input';
import { GetAvailableBalanceUseCase } from '@/modules/finance/application/use-cases/get-available-balance.use-case';
import { GetAvailableBalanceController } from '@/modules/finance/presentation/http/controllers/get-available-balance.controller';

describe('GetAvailableBalanceController', () => {
  let useCase: jest.Mocked<GetAvailableBalanceUseCase>;
  let controller: GetAvailableBalanceController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAvailableBalanceUseCase>;

    controller = new GetAvailableBalanceController(useCase);
  });

  it('deve retornar status 200 com o saldo disponível', async () => {
    const output: AvailableBalanceOutput = {
      totalIncome: 1000,
      totalExpense: 300,
      balance: 700,
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-123',
    });

    const expectedInput: GetAvailableBalanceInput = {
      userId: 'user-123',
    };

    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(useCase.execute).toHaveBeenCalledWith(expectedInput);

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });
});
