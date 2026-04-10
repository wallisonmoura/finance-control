export class InvalidDebtDueDateError extends Error {
  constructor() {
    super('Debt due date is required and must be valid.');
    this.name = 'InvalidDebtDueDateError';
  }
}
