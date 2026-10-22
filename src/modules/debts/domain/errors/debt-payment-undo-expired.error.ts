export class DebtPaymentUndoExpiredError extends Error {
  constructor() {
    super('O prazo pra desfazer este pagamento acabou.');
    this.name = 'DebtPaymentUndoExpiredError';
  }
}
