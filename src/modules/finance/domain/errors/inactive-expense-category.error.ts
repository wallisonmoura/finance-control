export class InactiveExpenseCategoryError extends Error {
  constructor() {
    super('Não é possível definir meta em uma categoria inativa.');
    this.name = 'InactiveExpenseCategoryError';
  }
}
