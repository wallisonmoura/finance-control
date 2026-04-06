import { RegisterIncomeUseCase } from '@/modules/finance/application/use-cases/register-income.use-case';
import { RegisterIncomeController } from '@/modules/finance/presentation/http/controllers/register-income.controller';
import { ZodError } from 'zod';

describe('RegisterIncomeController', () => {
  let execute: jest.Mock;
  let useCase: Pick<RegisterIncomeUseCase, 'execute'>;
  let controller: RegisterIncomeController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new RegisterIncomeController(useCase as RegisterIncomeUseCase);
  });

  it('deve chamar o use case com input correto e retornar 201', async () => {
    execute.mockResolvedValue({
      id: 'income-id',
      userId: 'user-id',
      type: 'INCOME',
      amount: 150,
      description: 'Corrida do dia',
      date: new Date('2026-04-01T00:00:00.000Z'),
      categoryId: null,
      notes: 'obs',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-01T10:00:00.000Z'),
    });

    const response = await controller.handle({
      userId: 'user-id',
      body: {
        amount: 150,
        description: 'Corrida do dia',
        date: '2026-04-01',
        notes: 'obs',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
      amount: 150,
      description: 'Corrida do dia',
      date: new Date('2026-04-01T00:00:00.000Z'),
      notes: 'obs',
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toMatchObject({
      id: 'income-id',
      userId: 'user-id',
      type: 'INCOME',
      amount: 150,
      description: 'Corrida do dia',
    });
  });

  it('deve lançar ZodError para payload inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        body: {
          amount: 0,
          description: '',
          date: 'data-invalida',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });
});
