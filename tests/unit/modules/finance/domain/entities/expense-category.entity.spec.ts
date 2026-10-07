import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { InvalidExpenseCategoryNameError } from '@/modules/finance/domain/errors/invalid-expense-category-name.error';
import { InvalidExpenseCategoryMonthlyLimitError } from '@/modules/finance/domain/errors/invalid-expense-category-monthly-limit.error';

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

  it('should create a valid category', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(category.id).toBe(baseProps.id);
    expect(category.userId).toBe(baseProps.userId);
    expect(category.name).toBe(baseProps.name);
    expect(category.slug).toBe(baseProps.slug);
    expect(category.isActive).toBe(true);
    expect(category.createdAt).toEqual(baseProps.createdAt);
    expect(category.updatedAt).toEqual(baseProps.updatedAt);
  });

  it('should fail to create a category without userId', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        userId: '',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should fail to create a category with userId containing only spaces', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        userId: '   ',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('should fail to create a category without a name', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        name: '',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('should fail to create a category with name containing only spaces', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        name: '   ',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('should fail to create a category without a slug', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        slug: '',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('should fail to create a category with slug containing only spaces', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        slug: '   ',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('should activate an inactive category', () => {
    const category = ExpenseCategory.create({
      ...baseProps,
      isActive: false,
    });

    const activated = category.activate();

    expect(activated).toBeInstanceOf(ExpenseCategory);
    expect(activated.isActive).toBe(true);
    expect(activated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      category.updatedAt.getTime(),
    );
  });

  it('should deactivate an active category', () => {
    const category = ExpenseCategory.create(baseProps);

    const deactivated = category.deactivate();

    expect(deactivated).toBeInstanceOf(ExpenseCategory);
    expect(deactivated.isActive).toBe(false);
    expect(deactivated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      category.updatedAt.getTime(),
    );
  });

  it('should update the category name and slug', () => {
    const category = ExpenseCategory.create(baseProps);

    const updated = category.update({
      name: 'Manutenção',
      slug: 'manutencao',
    });

    expect(updated).toBeInstanceOf(ExpenseCategory);
    expect(updated.id).toBe(baseProps.id);
    expect(updated.userId).toBe(baseProps.userId);
    expect(updated.name).toBe('Manutenção');
    expect(updated.slug).toBe('manutencao');
    expect(updated.isActive).toBe(baseProps.isActive);
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      category.updatedAt.getTime(),
    );
  });

  it('should keep the current name and slug when update is called without data', () => {
    const category = ExpenseCategory.create(baseProps);

    const updated = category.update({});

    expect(updated.name).toBe(baseProps.name);
    expect(updated.slug).toBe(baseProps.slug);
  });

  it('should validate the name when updating a category', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(() =>
      category.update({
        name: '',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('should validate the slug when updating a category', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(() =>
      category.update({
        slug: '',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('should return the category data in toJSON', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(category.toJSON()).toEqual(baseProps);
  });
});

describe('ExpenseCategory monthly limit', () => {
  function category(monthlyLimit?: number | null) {
    return ExpenseCategory.create({
      id: 'cat-1',
      userId: 'user-1',
      name: 'Lazer',
      slug: 'lazer',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      monthlyLimit,
    });
  }

  it('should default to no monthly limit', () => {
    expect(category().monthlyLimit).toBeNull();
  });

  it('should accept a positive monthly limit', () => {
    expect(category(300).monthlyLimit).toBe(300);
  });

  it.each([0, -10, Number.NaN])(
    'should reject a monthly limit of %s',
    (value) => {
      expect(() => category(value)).toThrow(
        InvalidExpenseCategoryMonthlyLimitError,
      );
    },
  );

  it('should set and remove the monthly limit without mutating the original', () => {
    const original = category();
    const withLimit = original.withMonthlyLimit(250.5);

    expect(withLimit.monthlyLimit).toBe(250.5);
    expect(withLimit.withMonthlyLimit(null).monthlyLimit).toBeNull();
    expect(original.monthlyLimit).toBeNull();
  });
});
