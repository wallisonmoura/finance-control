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

    expect(category.id).toBe(baseProps.id);
    expect(category.userId).toBe(baseProps.userId);
    expect(category.name).toBe(baseProps.name);
    expect(category.slug).toBe(baseProps.slug);
    expect(category.isActive).toBe(true);
    expect(category.createdAt).toEqual(baseProps.createdAt);
    expect(category.updatedAt).toEqual(baseProps.updatedAt);
  });

  it('deve falhar ao criar categoria sem userId', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        userId: '',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('deve falhar ao criar categoria com userId contendo apenas espaços', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        userId: '   ',
      }),
    ).toThrow('ID do usuário é obrigatório.');
  });

  it('deve falhar ao criar categoria sem nome', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        name: '',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('deve falhar ao criar categoria com nome contendo apenas espaços', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        name: '   ',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('deve falhar ao criar categoria sem slug', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        slug: '',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('deve falhar ao criar categoria com slug contendo apenas espaços', () => {
    expect(() =>
      ExpenseCategory.create({
        ...baseProps,
        slug: '   ',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('deve ativar uma categoria inativa', () => {
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

  it('deve desativar uma categoria ativa', () => {
    const category = ExpenseCategory.create(baseProps);

    const deactivated = category.deactivate();

    expect(deactivated).toBeInstanceOf(ExpenseCategory);
    expect(deactivated.isActive).toBe(false);
    expect(deactivated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      category.updatedAt.getTime(),
    );
  });

  it('deve atualizar nome e slug da categoria', () => {
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

  it('deve manter nome e slug atuais quando update for chamado sem dados', () => {
    const category = ExpenseCategory.create(baseProps);

    const updated = category.update({});

    expect(updated.name).toBe(baseProps.name);
    expect(updated.slug).toBe(baseProps.slug);
  });

  it('deve validar nome ao atualizar categoria', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(() =>
      category.update({
        name: '',
      }),
    ).toThrow(InvalidExpenseCategoryNameError);
  });

  it('deve validar slug ao atualizar categoria', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(() =>
      category.update({
        slug: '',
      }),
    ).toThrow('Slug da categoria de despesa é obrigatório.');
  });

  it('deve retornar os dados da categoria em toJSON', () => {
    const category = ExpenseCategory.create(baseProps);

    expect(category.toJSON()).toEqual(baseProps);
  });
});
