export class DebtNotFoundError extends Error {
  constructor() {
    super('Dívida não encontrada.');
    this.name = 'DebtNotFoundError';
  }
}
