import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { ExpenseCategoryRequiredError } from '@/modules/finance/domain/errors/expense-category-required.error';
import { InvalidFinancialEntryAmountError } from '@/modules/finance/domain/errors/invalid-financial-entry-amount.error';

describe('FinancialEntry', () => {
  const baseProps = {
    id: 'entry-1',
    userId: 'user-1',
    amount: 100,
    description: 'Daily income',
    date: new Date('2026-03-23'),
    createdAt: new Date('2026-03-23T10:00:00Z'),
    updatedAt: new Date('2026-03-23T10:00:00Z'),
  };

  it('deve criar uma receita válida', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(entry.type).toBe(FinancialEntryType.INCOME);
    expect(entry.categoryId).toBeNull();
  });

  it('deve criar uma despesa válida com categoria', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
    });

    expect(entry.type).toBe(FinancialEntryType.EXPENSE);
    expect(entry.categoryId).toBe('category-1');
  });

  it('deve falhar ao criar lançamento com valor zero', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: 0,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('deve falhar ao criar despesa sem categoria', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.EXPENSE,
      }),
    ).toThrow(ExpenseCategoryRequiredError);
  });

  it('deve limpar categoryId quando for receita', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
      categoryId: 'category-1',
    });

    expect(entry.categoryId).toBeNull();
  });

  it('deve atualizar uma despesa mantendo consistência', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
    });

    const updated = entry.update({
      amount: 150,
      description: 'Fuel',
    });

    expect(updated.amount).toBe(150);
    expect(updated.description).toBe('Fuel');
    expect(updated.categoryId).toBe('category-1');
  });
});
