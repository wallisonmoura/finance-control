export class UnauthorizedFinancialEntryAccessError extends Error {
  constructor() {
    super('Você não tem acesso a este lançamento financeiro.');
    this.name = 'UnauthorizedFinancialEntryAccessError';
  }
}
