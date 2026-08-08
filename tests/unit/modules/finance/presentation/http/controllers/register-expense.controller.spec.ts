import { RegisterExpenseUseCase } from '@/modules/finance/application/use-cases/register-expense.use-case';
import { RegisterExpenseController } from '@/modules/finance/presentation/http/controllers/register-expense.controller';
import { ZodError } from 'zod';

describe('RegisterExpenseController', () => {
  let execute: jest.Mock;
  let useCase: Pick<RegisterExpenseUseCase, 'execute'>;
  let controller: RegisterExpenseController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new RegisterExpenseController(
      useCase as RegisterExpenseUseCase,
    );
  });

  it('should call the use case with correct input and return 201', async () => {
    execute.mockResolvedValue({
      id: 'expense-id',
      userId: 'user-id',
      type: 'EXPENSE',
      amount: 50,
      description: 'Abastecimento',
      date: new Date('2026-04-01T00:00:00.000Z'),
      categoryId: 'category-id',
      notes: 'obs',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T10:00:00.000Z'),
    });

    const response = await controller.handle({
      userId: 'user-id',
      body: {
        amount: 50,
        description: 'Abastecimento',
        date: '2026-04-01',
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
        notes: 'obs',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
      amount: 50,
      description: 'Abastecimento',
      date: new Date('2026-04-01T00:00:00.000Z'),
      categoryId: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'obs',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: 'expense-id',
      userId: 'user-id',
      type: 'EXPENSE',
      amount: 50,
      description: 'Abastecimento',
    });
  });

  it('should throw ZodError for invalid payload', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
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
