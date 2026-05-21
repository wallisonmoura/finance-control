export class InvalidDebtPaidStateError extends Error {
  constructor() {
    super('Dívida paga deve ter data e origem de pagamento.');
    this.name = 'InvalidDebtPaidStateError';
  }
}
