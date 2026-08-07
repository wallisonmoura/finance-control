export class UnauthorizedDebtAccessError extends Error {
  constructor() {
    super('Você não tem acesso a esta dívida.');
    this.name = 'UnauthorizedDebtAccessError';
  }
}
