export class FinancialEntryNotFoundError extends Error {
  constructor() {
    super('Financial entry not found.');
    this.name = 'FinancialEntryNotFoundError';
  }
}
