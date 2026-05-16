import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import { UpdateIncomeController } from '@/modules/finance/presentation/http/controllers/update-income.controller';
import { ZodError } from 'zod';

describe('UpdateIncomeController', () => {
  const incomeId = '550e8400-e29b-41d4-a716-446655440001';

  let execute: jest.Mock;
  let useCase: Pick<UpdateIncomeUseCase, 'execute'>;
  let controller: UpdateIncomeController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new UpdateIncomeController(useCase as UpdateIncomeUseCase);
  });

  it('deve chamar o use case com input correto e retornar 200', async () => {
    execute.mockResolvedValue({
      id: incomeId,
      userId: 'user-id',
      type: 'INCOME',
      amount: 180,
      description: 'Receita atualizada',
      date: new Date('2026-04-02T00:00:00.000Z'),
      categoryId: null,
      notes: 'obs',
      createdAt: new Date('2026-04-01T10:00:00.000Z'),
      updatedAt: new Date('2026-04-02T10:00:00.000Z'),
    });

    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: incomeId,
      },
      body: {
        amount: 180,
        description: 'Receita atualizada',
        date: '2026-04-02',
        notes: 'obs',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: incomeId,
      userId: 'user-id',
      amount: 180,
      description: 'Receita atualizada',
      date: new Date('2026-04-02T00:00:00.000Z'),
      notes: 'obs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: incomeId,
      type: 'INCOME',
      amount: 180,
      description: 'Receita atualizada',
    });
  });

  it('deve lançar ZodError para payload inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: incomeId,
        },
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
