import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { ExpenseCategoryRequiredError } from '@/modules/finance/domain/errors/expense-category-required.error';
import { InvalidFinancialEntryAmountError } from '@/modules/finance/domain/errors/invalid-financial-entry-amount.error';
import { InvalidFinancialEntryTypeError } from '@/modules/finance/domain/errors/invalid-financial-entry-type.error';

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

  it('should create a valid income', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(entry.id).toBe(baseProps.id);
    expect(entry.userId).toBe(baseProps.userId);
    expect(entry.type).toBe(FinancialEntryType.INCOME);
    expect(entry.amount).toBe(baseProps.amount);
    expect(entry.description).toBe(baseProps.description);
    expect(entry.date).toEqual(baseProps.date);
    expect(entry.categoryId).toBeNull();
    expect(entry.notes).toBeNull();
    expect(entry.createdAt).toEqual(baseProps.createdAt);
    expect(entry.updatedAt).toEqual(baseProps.updatedAt);
    expect(entry.isIncome()).toBe(true);
    expect(entry.isExpense()).toBe(false);
  });

  it('should create a valid expense with category', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
      notes: 'Fuel payment',
    });

    expect(entry.type).toBe(FinancialEntryType.EXPENSE);
    expect(entry.categoryId).toBe('category-1');
    expect(entry.notes).toBe('Fuel payment');
    expect(entry.isIncome()).toBe(false);
    expect(entry.isExpense()).toBe(true);
  });

  it('should set categoryId and notes to null when omitted', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(entry.categoryId).toBeNull();
    expect(entry.notes).toBeNull();
  });

  it('should fail to create an entry with invalid type', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: 'INVALID_TYPE' as FinancialEntryType,
      }),
    ).toThrow(InvalidFinancialEntryTypeError);
  });

  it('should fail to create an entry with zero amount', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: 0,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('should fail to create an entry with negative amount', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: -1,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('should fail to create an entry with non-finite amount', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: Number.NaN,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('should fail to create an entry without userId', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        userId: '',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should fail to create an entry with userId containing only spaces', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        userId: '   ',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should fail to create an entry without a description', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        description: '',
      }),
    ).toThrow('Descrição é obrigatória.');
  });

  it('should fail to create an entry with description containing only spaces', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        description: '   ',
      }),
    ).toThrow('Descrição é obrigatória.');
  });

  it('should fail to create an entry with invalid date', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        date: new Date('invalid-date'),
      }),
    ).toThrow('Data válida é obrigatória.');
  });

  it('should fail to create an entry with date that is not a Date', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        date: '2026-03-23' as unknown as Date,
      }),
    ).toThrow('Data válida é obrigatória.');
  });

  it('should fail to create an expense without a category', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.EXPENSE,
      }),
    ).toThrow(ExpenseCategoryRequiredError);
  });

  it('should fail to create an expense with categoryId null', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.EXPENSE,
        categoryId: null,
      }),
    ).toThrow(ExpenseCategoryRequiredError);
  });

  it('should clear categoryId when it is an income', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
      categoryId: 'category-1',
    });

    expect(entry.categoryId).toBeNull();
  });

  it('should update an expense keeping consistency', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
    });

    const updated = entry.update({
      amount: 150,
      description: 'Fuel',
    });

    expect(updated).toBeInstanceOf(FinancialEntry);
    expect(updated.id).toBe(baseProps.id);
    expect(updated.userId).toBe(baseProps.userId);
    expect(updated.type).toBe(FinancialEntryType.EXPENSE);
    expect(updated.amount).toBe(150);
    expect(updated.description).toBe('Fuel');
    expect(updated.categoryId).toBe('category-1');
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      entry.updatedAt.getTime(),
    );
  });

  it('should update date, category and notes of an expense', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
      notes: 'Old notes',
    });

    const newDate = new Date('2026-03-24');

    const updated = entry.update({
      date: newDate,
      categoryId: 'category-2',
      notes: 'New notes',
    });

    expect(updated.date).toEqual(newDate);
    expect(updated.categoryId).toBe('category-2');
    expect(updated.notes).toBe('New notes');
  });

  it('should keep the current data when update is called without data', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
      notes: 'Current notes',
    });

    const updated = entry.update({});

    expect(updated.amount).toBe(entry.amount);
    expect(updated.description).toBe(entry.description);
    expect(updated.date).toEqual(entry.date);
    expect(updated.categoryId).toBe(entry.categoryId);
    expect(updated.notes).toBe(entry.notes);
  });

  it('should keep categoryId null when updating an income', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    const updated = entry.update({
      categoryId: 'category-1',
      notes: 'Updated income',
    });

    expect(updated.categoryId).toBeNull();
    expect(updated.notes).toBe('Updated income');
  });

  it('should validate amount when updating an entry', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(() =>
      entry.update({
        amount: 0,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('should validate description when updating an entry', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(() =>
      entry.update({
        description: '',
      }),
    ).toThrow('Descrição é obrigatória.');
  });

  it('should validate date when updating an entry', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(() =>
      entry.update({
        date: new Date('invalid-date'),
      }),
    ).toThrow('Data válida é obrigatória.');
  });

  it('should return the entry data in toJSON', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
      notes: 'Fuel',
    });

    expect(entry.toJSON()).toEqual({
      ...baseProps,
      type: FinancialEntryType.EXPENSE,
      categoryId: 'category-1',
      debtId: null,
      notes: 'Fuel',
    });
  });
});
