export class InvalidExpenseCategoryNameError extends Error {
  constructor() {
    super('Nome da categoria de despesa é obrigatório.');
    this.name = 'InvalidExpenseCategoryNameError';
  }
}
