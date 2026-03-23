export class ExpenseCategoryRequiredError extends Error {
  constructor() {
    super('Expense category is required for expense entries.');
    this.name = 'ExpenseCategoryRequiredError';
  }
}
