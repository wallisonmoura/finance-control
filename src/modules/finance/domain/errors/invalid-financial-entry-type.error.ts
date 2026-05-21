export class InvalidFinancialEntryTypeError extends Error {
  constructor() {
    super('Tipo de lançamento financeiro inválido.');
    this.name = 'InvalidFinancialEntryTypeError';
  }
}
