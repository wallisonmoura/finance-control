import { UpdateDebtUseCase } from '@/modules/debts/application/use-cases/update-debt.use-case';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { UpdateDebtController } from '@/modules/debts/presentation/http/controllers/update-debt.controller';
import { ZodError } from 'zod';

describe('UpdateDebtController', () => {
  let execute: jest.Mock;
  let useCase: Pick<UpdateDebtUseCase, 'execute'>;
  let controller: UpdateDebtController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new UpdateDebtController(useCase as UpdateDebtUseCase);
  });

  it('deve atualizar uma dívida e retornar 200', async () => {
    const output = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-id',
      amount: 175.5,
      description: 'Parcela do cartão atualizada',
      dueDate: new Date('2026-05-12T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: 'Valor corrigido',
      paidAt: null,
      paymentSource: null,
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    };

    execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-id',
      params: {
        id: '550e8400-e29b-41d4-a716-446655440000',
      },
      body: {
        amount: 175.5,
        description: 'Parcela do cartão atualizada',
        dueDate: '2026-05-12',
        type: DebtType.ONE_TIME,
        notes: 'Valor corrigido',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-id',
      amount: 175.5,
      description: 'Parcela do cartão atualizada',
      dueDate: new Date('2026-05-12T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      notes: 'Valor corrigido',
    });

    expect(response).toEqual({
      statusCode: 200,
      body: {
        ...output,
        dueDate: '2026-05-12',
      },
    });
  });

  it('deve propagar erro de validação quando o id for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: 'id-invalido',
        },
        body: {
          amount: 175.5,
          description: 'Parcela do cartão atualizada',
          dueDate: '2026-05-12',
          type: DebtType.ONE_TIME,
          notes: 'Valor corrigido',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });

  it('deve propagar erro de validação quando o payload for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: '550e8400-e29b-41d4-a716-446655440000',
        },
        body: {
          amount: -10,
          description: '',
          dueDate: '2026-99-99',
          type: 'INVALID',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });
});
