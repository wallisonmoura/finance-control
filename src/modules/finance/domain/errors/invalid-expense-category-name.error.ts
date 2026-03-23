export class InvalidExpenseCategoryNameError extends Error {
  constructor() {
    super('Expense category name is required.');
    this.name = 'InvalidExpenseCategoryNameError';
  }
}
