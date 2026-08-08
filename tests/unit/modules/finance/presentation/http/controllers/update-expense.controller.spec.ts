import { UpdateExpenseUseCase } from '@/modules/finance/application/use-cases/update-expense.use-case';
import { UpdateExpenseController } from '@/modules/finance/presentation/http/controllers/update-expense.controller';
import { ZodError } from 'zod';

describe('UpdateExpenseController', () => {
  const expenseId = '550e8400-e29b-41d4-a716-446655440002';

  let execute: jest.Mock;
  let useCase: Pick<UpdateExpenseUseCase, 'execute'>;
  let controller: UpdateExpenseController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new UpdateExpenseController(useCase as UpdateExpenseUseCase);
  });

  it('should call the use case with correct input and return 200', async () => {
    execute.mockResolvedValue({
      id: expenseId,
      userId: 'user-id',
      type: 'EXPENSE',
      amount: 90,
      description: 'Despesa atualizada',
      date: new Date('2026-04-02T00:00:00.000Z'),
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'obs',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    });

    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: expenseId,
      },
      body: {
        amount: 90,
        description: 'Despesa atualizada',
        date: '2026-04-02',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'obs',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: expenseId,
      userId: 'user-id',
      amount: 90,
      description: 'Despesa atualizada',
      date: new Date('2026-04-02T00:00:00.000Z'),
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'obs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: expenseId,
      type: 'EXPENSE',
      amount: 90,
      description: 'Despesa atualizada',
    });
  });

  it('should throw ZodError for invalid payload', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: expenseId,
        },
        body: {
          amount: 0,
          description: '',
          date: 'data-invalida',
          categoryId: 'invalido',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });
});
