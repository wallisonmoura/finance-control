import { DeleteIncomeUseCase } from '@/modules/finance/application/use-cases/delete-income.use-case';
import { DeleteIncomeController } from '@/modules/finance/presentation/http/controllers/delete-income.controller';

describe('DeleteIncomeController', () => {
  const incomeId = '550e8400-e29b-41d4-a716-446655440001';

  let execute: jest.Mock;
  let useCase: Pick<DeleteIncomeUseCase, 'execute'>;
  let controller: DeleteIncomeController;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue(undefined);

    useCase = {
      execute,
    };

    controller = new DeleteIncomeController(useCase as DeleteIncomeUseCase);
  });

  it('deve chamar o use case com input correto e retornar 204', async () => {
    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: incomeId,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: incomeId,
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 204,
      body: null,
    });
  });
});
