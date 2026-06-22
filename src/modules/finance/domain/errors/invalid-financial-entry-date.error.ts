export class InvalidFinancialEntryDateError extends Error {
  constructor() {
    super('Data válida é obrigatória.');
    this.name = 'InvalidFinancialEntryDateError';
  }
}
