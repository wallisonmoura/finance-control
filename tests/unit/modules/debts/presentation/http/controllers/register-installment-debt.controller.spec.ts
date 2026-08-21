import { RegisterInstallmentDebtController } from '@/modules/debts/presentation/http/controllers/register-installment-debt.controller';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';

describe('RegisterInstallmentDebtController', () => {
  it('should call the use case with parsed input and return 201 with the created debts', async () => {
    const now = new Date();
    const execute = jest.fn().mockResolvedValue([
      {
        id: 'debt-1',
        userId: 'user-1',
        description: 'Cartão Letícia',
        amount: 333.33,
        dueDate: new Date('2026-08-29'),
        type: DebtType.RECURRING,
        status: DebtStatus.PENDING,
        notes: 'Parcela 01/03',
        paidAt: null,
        paymentSource: null,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const sut = new RegisterInstallmentDebtController({ execute });

    const response = await sut.handle({
      userId: 'user-1',
      body: {
        description: 'Cartão Letícia',
        amount: 1000,
        dueDate: '2026-08-29',
        installmentCount: 3,
      },
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-1',
      description: 'Cartão Letícia',
      amount: 1000,
      dueDate: new Date('2026-08-29T00:00:00.000Z'),
      installmentCount: 3,
      notes: undefined,
    });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveLength(1);
    expect(response.body?.[0].notes).toBe('Parcela 01/03');
    expect(response.body?.[0].dueDate).toBe('2026-08-29');
  });

  it('should pass notes through to the use case when provided', async () => {
    const execute = jest.fn().mockResolvedValue([]);
    const sut = new RegisterInstallmentDebtController({ execute });

    await sut.handle({
      userId: 'user-1',
      body: {
        description: 'Compra TV',
        amount: 600,
        dueDate: '2026-08-29',
        installmentCount: 2,
        notes: 'Loja Magazine',
      },
    });

    expect(execute).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Loja Magazine' }),
    );
  });
});
