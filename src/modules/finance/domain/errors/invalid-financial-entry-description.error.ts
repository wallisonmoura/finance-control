export class InvalidFinancialEntryDescriptionError extends Error {
  constructor() {
    super('Descrição é obrigatória.');
    this.name = 'InvalidFinancialEntryDescriptionError';
  }
}
