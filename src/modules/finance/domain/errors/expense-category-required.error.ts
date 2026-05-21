export class ExpenseCategoryRequiredError extends Error {
  constructor() {
    super('Categoria de despesa é obrigatória para despesas.');
    this.name = 'ExpenseCategoryRequiredError';
  }
}
