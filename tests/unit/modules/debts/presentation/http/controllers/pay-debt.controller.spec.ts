import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import {
  PayDebtController,
  PayDebtUseCaseContract,
} from '@/modules/debts/presentation/http/controllers/pay-debt.controller';
import { ZodError } from 'zod';

describe('PayDebtController', () => {
  let execute: jest.Mock;
  let useCase: Pick<PayDebtUseCaseContract, 'execute'>;
  let controller: PayDebtController;

  beforeEach(() => {
    execute = jest.fn();

    useCase = {
      execute,
    };

    controller = new PayDebtController(useCase);
  });

  it('deve pagar uma dívida e retornar 200', async () => {
    const output: DebtOutput = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-id',
      amount: 175.5,
      description: 'Parcela do cartão',
      dueDate: new Date('2026-05-12T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
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
        paidAt: '2026-05-12',
        expenseCategoryId: '660e8400-e29b-41d4-a716-446655440000',
        paymentSource: DebtPaymentSource.BANK,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      id: '550e8400-e29b-41d4-a716-446655440000',
      userId: 'user-id',
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      expenseCategoryId: '660e8400-e29b-41d4-a716-446655440000',
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('deve propagar erro de validação quando o id da dívida for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-id',
        params: {
          id: 'id-invalido',
        },
        body: {
          paidAt: '2026-05-12',
          expenseCategoryId: '660e8400-e29b-41d4-a716-446655440000',
          paymentSource: DebtPaymentSource.BANK,
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
          paidAt: '2026-99-99',
          expenseCategoryId: 'categoria-invalida',
          paymentSource: 'PIX',
        },
      }),
    ).rejects.toBeInstanceOf(ZodError);

    expect(execute).not.toHaveBeenCalled();
  });
});
