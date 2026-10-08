export class InvalidExpenseCategoryMonthlyLimitError extends Error {
  constructor() {
    super('Limite mensal deve ser maior que zero.');
    this.name = 'InvalidExpenseCategoryMonthlyLimitError';
  }
}
