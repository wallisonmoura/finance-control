export class UnauthorizedFinancialEntryAccessError extends Error {
  constructor() {
    super('You do not have access to this financial entry.');
    this.name = 'UnauthorizedFinancialEntryAccessError';
  }
}
