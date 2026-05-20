import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { FinanceHttpPresenter } from '@/modules/finance/presentation/http/presenters/finance-http.presenter';

describe('FinanceHttpPresenter', () => {
  const baseOutput = {
    id: 'entry-1',
    userId: 'user-1',
    type: FinancialEntryType.INCOME,
    amount: 100,
    description: 'Venda',
    date: new Date('2026-03-23T00:00:00.000Z'),
    categoryId: null,
    notes: 'observação',
    createdAt: new Date('2026-03-23T10:00:00.000Z'),
    updatedAt: new Date('2026-03-23T10:00:00.000Z'),
  };

  it('deve converter FinancialEntryOutput para resposta HTTP', () => {
    const response = FinanceHttpPresenter.toResponse(baseOutput);

    expect(response).toEqual({
      id: 'entry-1',
      userId: 'user-1',
      type: FinancialEntryType.INCOME,
      amount: 100,
      description: 'Venda',
      date: '2026-03-23',
      categoryId: null,
      debtId: null,
      notes: 'observação',
      createdAt: '2026-03-23T10:00:00.000Z',
      updatedAt: '2026-03-23T10:00:00.000Z',
    });
  });

  it('deve retornar categoryId e notes como null quando não estiverem preenchidos', () => {
    const response = FinanceHttpPresenter.toResponse({
      ...baseOutput,
      categoryId: undefined as unknown as null,
      notes: undefined as unknown as null,
    });

    expect(response.categoryId).toBeNull();
    expect(response.notes).toBeNull();
  });
});
