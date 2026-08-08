import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { DebtHttpPresenter } from '@/modules/debts/presentation/http/presenters/debt-http.presenter';

describe('DebtHttpPresenter', () => {
  const baseOutput: DebtOutput = {
    id: 'debt-1',
    userId: 'user-1',
    description: 'Parcela do cartão',
    amount: 150.75,
    dueDate: new Date('2026-05-10T00:00:00.000Z'),
    type: DebtType.ONE_TIME,
    status: DebtStatus.PENDING,
    notes: 'observação',
    paidAt: null,
    paymentSource: null,
    createdAt: new Date('2026-05-01T10:00:00.000Z'),
    updatedAt: new Date('2026-05-01T10:00:00.000Z'),
  };

  it('deve converter DebtOutput para resposta HTTP formatando dueDate como YYYY-MM-DD', () => {
    const response = DebtHttpPresenter.toResponse(baseOutput);

    expect(response).toEqual({
      id: 'debt-1',
      userId: 'user-1',
      description: 'Parcela do cartão',
      amount: 150.75,
      dueDate: '2026-05-10',
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: 'observação',
      paidAt: null,
      paymentSource: null,
      createdAt: baseOutput.createdAt,
      updatedAt: baseOutput.updatedAt,
    });
  });

  it('deve formatar paidAt como YYYY-MM-DD quando a dívida estiver paga', () => {
    const paidOutput: DebtOutput = {
      ...baseOutput,
      status: DebtStatus.PAID,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    };

    const response = DebtHttpPresenter.toResponse(paidOutput);

    expect(response.paidAt).toBe('2026-05-12');
    expect(response.paymentSource).toBe(DebtPaymentSource.BANK);
  });

  it('deve retornar paidAt como null quando a dívida estiver pendente', () => {
    const response = DebtHttpPresenter.toResponse(baseOutput);

    expect(response.paidAt).toBeNull();
  });

  it('deve converter uma lista de DebtOutput para lista de resposta HTTP', () => {
    const secondOutput: DebtOutput = {
      ...baseOutput,
      id: 'debt-2',
      dueDate: new Date('2026-06-15T00:00:00.000Z'),
    };

    const response = DebtHttpPresenter.toResponseList([
      baseOutput,
      secondOutput,
    ]);

    expect(response).toEqual([
      DebtHttpPresenter.toResponse(baseOutput),
      DebtHttpPresenter.toResponse(secondOutput),
    ]);
    expect(response[0].dueDate).toBe('2026-05-10');
    expect(response[1].dueDate).toBe('2026-06-15');
  });

  it('deve retornar lista vazia quando não houver dívidas', () => {
    expect(DebtHttpPresenter.toResponseList([])).toEqual([]);
  });
});
