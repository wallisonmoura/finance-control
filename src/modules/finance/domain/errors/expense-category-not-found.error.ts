export class ExpenseCategoryNotFoundError extends Error {
  constructor() {
    super('Categoria de despesa não encontrada.');
    this.name = 'ExpenseCategoryNotFoundError';
  }
}
