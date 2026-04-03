import { DeleteIncomeUseCase } from '@/modules/finance/application/use-cases/delete-income.use-case';
import { DeleteIncomeController } from '@/modules/finance/presentation/http/controllers/delete-income.controller';

describe('DeleteIncomeController', () => {
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
        id: 'income-id',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: 'income-id',
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 204,
      body: null,
    });
  });
});
