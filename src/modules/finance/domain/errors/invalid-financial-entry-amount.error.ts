export class InvalidFinancialEntryAmountError extends Error {
  constructor() {
    super('O valor do lançamento financeiro deve ser maior que zero.');
    this.name = 'InvalidFinancialEntryAmountError';
  }
}
