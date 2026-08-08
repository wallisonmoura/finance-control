import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { DeleteExpenseController } from '@/modules/finance/presentation/http/controllers/delete-expense.controller';

describe('DeleteExpenseController', () => {
  const expenseId = '550e8400-e29b-41d4-a716-446655440002';

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

  it('should call the use case with correct input and return 204', async () => {
    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: expenseId,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: expenseId,
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 204,
      body: null,
    });
  });
});
