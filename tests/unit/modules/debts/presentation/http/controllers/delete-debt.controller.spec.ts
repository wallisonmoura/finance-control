import { DeleteDebtUseCase } from '@/modules/debts/application/use-cases/delete-debt.use-case';
import { DeleteDebtController } from '@/modules/debts/presentation/http/controllers/delete-debt.controller';
import { ZodError } from 'zod';

describe('DeleteDebtController', () => {
  let execute: jest.Mock;
  let useCase: Pick<DeleteDebtUseCase, 'execute'>;
  let controller: DeleteDebtController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new DeleteDebtController(useCase as DeleteDebtUseCase);
  });

  it('deve excluir uma dívida e retornar 204', async () => {
    execute.mockResolvedValue(undefined);

    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 204,
      body: null,
    });
  });

  it('deve propagar erro de validação quando o id for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: 'id-invalido',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });
});
