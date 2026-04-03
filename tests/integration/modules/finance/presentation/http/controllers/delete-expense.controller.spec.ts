import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { DeleteExpenseController } from '@/modules/finance/presentation/http/controllers/delete-expense.controller';

describe('DeleteExpenseController', () => {
  let execute: jest.Mock;
  let useCase: Pick<DeleteExpenseUseCase, 'execute'>;
  let controller: DeleteExpenseController;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue(undefined);

    useCase = {
      execute,
    };

    controller = new DeleteExpenseController(useCase as DeleteExpenseUseCase);
  });

  it('deve chamar o use case com input correto e retornar 204', async () => {
    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: 'expense-id',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: 'expense-id',
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 204,
      body: null,
    });
  });
});
