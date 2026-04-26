export class InvalidDebtPendingStateError extends Error {
  constructor() {
    super('Pending debt cannot have paidAt or paymentSource.');
    this.name = 'InvalidDebtPendingStateError';
  }
}
