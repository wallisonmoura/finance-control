export class DebtAlreadyPaidError extends Error {
  constructor() {
    super('Debt is already paid.');
    this.name = 'DebtAlreadyPaidError';
  }
}
