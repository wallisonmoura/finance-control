import { RegisterDebtUseCase } from '@/modules/debts/application/use-cases/register-debt.use-case';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { RegisterDebtController } from '@/modules/debts/presentation/http/controllers/register-debt.controller';
import { ZodError } from 'zod';

describe('RegisterDebtController', () => {
  let execute: jest.Mock;
  let useCase: Pick<RegisterDebtUseCase, 'execute'>;
  let controller: RegisterDebtController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new RegisterDebtController(useCase as RegisterDebtUseCase);
  });

  it('should register a debt and return 201', async () => {
    const output = {
      id: 'debt-id',
      userId: 'user-id',
      amount: 150.75,
      description: 'Parcela do cartão',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: 'Teste manual do módulo Debts',
      paidAt: null,
      paymentSource: null,
      createdAt: new Date('2026-05-01T00:00:00.000Z'),
      updatedAt: new Date('2026-05-01T00:00:00.000Z'),
    };

    execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-id',
      body: {
        amount: 150.75,
        description: 'Parcela do cartão',
        dueDate: '2026-05-10',
        type: DebtType.ONE_TIME,
        notes: 'Teste manual do módulo Debts',
      },
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
      amount: 150.75,
      description: 'Parcela do cartão',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      notes: 'Teste manual do módulo Debts',
    });

    expect(response).toEqual({
      statusCode: 201,
      body: {
        ...output,
        dueDate: '2026-05-10',
      },
    });
  });

  it('should propagate a validation error when the payload is invalid', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
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
