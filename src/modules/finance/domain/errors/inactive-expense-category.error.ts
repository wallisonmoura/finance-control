export const INACTIVE_CATEGORY_MESSAGE =
  'Não é possível lançar despesa em uma categoria inativa.';

export class InactiveExpenseCategoryError extends Error {
  constructor(message = 'Não é possível definir meta em uma categoria inativa.') {
    super(message);
    this.name = 'InactiveExpenseCategoryError';
  }
}
