import { ListPendingDebtsUseCase } from '@/modules/debts/application/use-cases/list-pending-debts.use-case';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { ListPendingDebtsController } from '@/modules/debts/presentation/http/controllers/list-pending-debts.controller';

describe('ListPendingDebtsController', () => {
  let execute: jest.Mock;
  let useCase: Pick<ListPendingDebtsUseCase, 'execute'>;
  let controller: ListPendingDebtsController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new ListPendingDebtsController(
      useCase as ListPendingDebtsUseCase,
    );
  });

  it('deve listar as dívidas pendentes do usuário autenticado e retornar 200', async () => {
    const output = [
      {
        id: 'debt-id',
        userId: 'user-id',
        amount: 150.75,
        description: 'Parcela do cartão',
        dueDate: new Date('2026-05-10T00:00:00.000Z'),
        type: DebtType.ONE_TIME,
        status: DebtStatus.PENDING,
        notes: null,
        paidAt: null,
        paymentSource: null,
        createdAt: new Date('2026-05-01T00:00:00.000Z'),
        updatedAt: new Date('2026-05-01T00:00:00.000Z'),
      },
    ];

    execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-id',
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });
});
