export class InvalidDebtPaidStateError extends Error {
  constructor() {
    super('Paid debt must have paidAt and paymentSource.');
    this.name = 'InvalidDebtPaidStateError';
  }
}
