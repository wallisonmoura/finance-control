import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { UndoDebtPaymentController } from '@/modules/debts/presentation/http/controllers/undo-debt-payment.controller';
import { ZodError } from 'zod';

const DEBT_ID = '550e8400-e29b-41d4-a716-446655440000';

describe('UndoDebtPaymentController', () => {
  let execute: jest.Mock;
  let controller: UndoDebtPaymentController;

  beforeEach(() => {
    execute = jest.fn();
    controller = new UndoDebtPaymentController({ execute });
  });

  it('should undo the payment for the authenticated user and return 200 with the pending debt', async () => {
    const output: DebtOutput = {
      id: DEBT_ID,
      userId: 'user-id',
      amount: 120,
      description: 'Internet',
      dueDate: new Date('2026-10-20T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
      paymentRecordedAt: null,
      createdAt: new Date('2026-10-01T00:00:00.000Z'),
      updatedAt: new Date('2026-10-21T00:00:00.000Z'),
    };
    execute.mockResolvedValue(output);

    const response = await controller.handle({ userId: 'user-id', params: { id: DEBT_ID } });

    expect(execute).toHaveBeenCalledWith({ id: DEBT_ID, userId: 'user-id' });
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({
      id: DEBT_ID,
      status: DebtStatus.PENDING,
      dueDate: '2026-10-20',
      paidAt: null,
      paymentRecordedAt: null,
    });
  });

  it('should propagate a validation error when the debt id is invalid', async () => {
    await expect(
      controller.handle({ userId: 'user-id', params: { id: 'id-invalido' } }),
    ).rejects.toBeInstanceOf(ZodError);
    expect(execute).not.toHaveBeenCalled();
  });
});
