export class InvalidFinancialEntryAmountError extends Error {
  constructor() {
    super('Financial entry amount must be greater than zero.');
    this.name = 'InvalidFinancialEntryAmountError';
  }
}
