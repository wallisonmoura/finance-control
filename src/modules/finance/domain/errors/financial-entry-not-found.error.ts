export class FinancialEntryNotFoundError extends Error {
  constructor() {
    super('Lançamento financeiro não encontrado.');
    this.name = 'FinancialEntryNotFoundError';
  }
}
