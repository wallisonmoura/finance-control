export class FinancialEntryLinkedToDebtError extends Error {
  constructor() {
    super('Financial entry linked to debt payment cannot be modified.');
    this.name = 'FinancialEntryLinkedToDebtError';
  }
}
