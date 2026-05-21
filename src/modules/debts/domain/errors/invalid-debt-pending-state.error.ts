export class InvalidDebtPendingStateError extends Error {
  constructor() {
    super('Dívida pendente não pode ter data ou origem de pagamento.');
    this.name = 'InvalidDebtPendingStateError';
  }
}
