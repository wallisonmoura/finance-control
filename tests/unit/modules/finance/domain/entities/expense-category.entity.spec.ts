import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { InvalidExpenseCategoryNameError } from '@/modules/finance/domain/errors/invalid-expense-category-name.error';

describe('ExpenseCategory', () => {
  const baseProps = {
    id: 'category-1',
    userId: 'user-1',
    name: 'Combustível',
    slug: 'combustivel',
    isActive: true,
    createdAt: new Date('2026-03-23T10:00:00Z'),
    updatedAt: new Date('2026-03-23T10:00:00Z'),
  };

  it('deve criar uma categoria válida', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(category.name).toBe('Combustível');
    expect(category.slug).toBe('combustivel');
    expect(category.isActive).toBe(true);
  });

  it('deve falhar ao criar categoria sem nome', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        name: '',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('deve desativar categoria', () => {
    const category = ExpenseCategory.create(baseProps);
    const updated = category.deactivate();

    expect(updated.isActive).toBe(false);
  });
});
