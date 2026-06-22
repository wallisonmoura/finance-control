export class InvalidExpenseCategorySlugError extends Error {
  constructor() {
    super('Slug da categoria de despesa é obrigatório.');
    this.name = 'InvalidExpenseCategorySlugError';
  }
}
