export class ExpenseCategoryNotFoundError extends Error {
  constructor() {
    super('Expense category not found.');
    this.name = 'ExpenseCategoryNotFoundError';
  }
}
