export class InvalidDebtAmountError extends Error {
  constructor() {
    super('Debt amount must be greater than zero.');
    this.name = 'InvalidDebtAmountError';
  }
}
