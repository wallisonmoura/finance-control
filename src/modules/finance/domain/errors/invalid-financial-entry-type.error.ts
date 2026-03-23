export class InvalidFinancialEntryTypeError extends Error {
  constructor() {
    super('Financial entry type is invalid.');
    this.name = 'InvalidFinancialEntryTypeError';
  }
}
