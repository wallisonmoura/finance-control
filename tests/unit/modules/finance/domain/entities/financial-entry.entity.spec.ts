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

  it('deve criar uma receita válida', () => {
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

  it('deve criar uma despesa válida com categoria', () => {
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

  it('deve definir categoryId e notes como null quando omitidos', () => {
    const entry = FinancialEntry.create({
      ...baseProps,
      type: FinancialEntryType.INCOME,
    });

    expect(entry.categoryId).toBeNull();
    expect(entry.notes).toBeNull();
  });

  it('deve falhar ao criar lançamento com tipo inválido', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: 'INVALID_TYPE' as FinancialEntryType,
      }),
    ).toThrow(InvalidFinancialEntryTypeError);
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

  it('deve falhar ao criar lançamento com valor negativo', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: -1,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('deve falhar ao criar lançamento com valor não finito', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        amount: Number.NaN,
      }),
    ).toThrow(InvalidFinancialEntryAmountError);
  });

  it('deve falhar ao criar lançamento sem userId', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        userId: '',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('deve falhar ao criar lançamento com userId contendo apenas espaços', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        userId: '   ',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('deve falhar ao criar lançamento sem descrição', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        description: '',
      }),
    ).toThrow('Descrição é obrigatória.');
  });

  it('deve falhar ao criar lançamento com descrição contendo apenas espaços', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        description: '   ',
      }),
    ).toThrow('Descrição é obrigatória.');
  });

  it('deve falhar ao criar lançamento com date inválida', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        date: new Date('invalid-date'),
      }),
    ).toThrow('Data válida é obrigatória.');
  });

  it('deve falhar ao criar lançamento com date que não é Date', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.INCOME,
        date: '2026-03-23' as unknown as Date,
      }),
    ).toThrow('Data válida é obrigatória.');
  });

  it('deve falhar ao criar despesa sem categoria', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.EXPENSE,
      }),
    ).toThrow(ExpenseCategoryRequiredError);
  });

  it('deve falhar ao criar despesa com categoryId null', () => {
    expect(() =>
      FinancialEntry.create({
        ...baseProps,
        type: FinancialEntryType.EXPENSE,
        categoryId: null,
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

  it('deve atualizar data, categoria e observações de uma despesa', () => {
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

  it('deve manter os dados atuais quando update for chamado sem dados', () => {
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

  it('deve manter categoryId null ao atualizar uma receita', () => {
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

  it('deve validar valor ao atualizar lançamento', () => {
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

  it('deve validar descrição ao atualizar lançamento', () => {
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

  it('deve validar data ao atualizar lançamento', () => {
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

  it('deve retornar os dados do lançamento em toJSON', () => {
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
