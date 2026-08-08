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

  it('should convert FinancialEntryOutput to HTTP response', () => {
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

  it('should return categoryId and notes as null when not filled', () => {
    const response = FinanceHttpPresenter.toResponse({
      ...baseOutput,
      categoryId: undefined as unknown as null,
      notes: undefined as unknown as null,
    });

    expect(response.categoryId).toBeNull();
    expect(response.notes).toBeNull();
  });

  it('should convert a list of FinancialEntryOutput to a list of HTTP responses', () => {
    const secondOutput = {
      ...baseOutput,
      id: 'entry-2',
      date: new Date('2026-03-24T00:00:00.000Z'),
    };

    const response = FinanceHttpPresenter.toResponseList([
      baseOutput,
      secondOutput,
    ]);

    expect(response).toEqual([
      FinanceHttpPresenter.toResponse(baseOutput),
      FinanceHttpPresenter.toResponse(secondOutput),
    ]);
    expect(response[0].date).toBe('2026-03-23');
    expect(response[1].date).toBe('2026-03-24');
  });

  it('should return an empty list when there are no entries', () => {
    expect(FinanceHttpPresenter.toResponseList([])).toEqual([]);
  });
});
