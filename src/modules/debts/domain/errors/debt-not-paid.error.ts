export class DebtNotPaidError extends Error {
  constructor() {
    super('Esta dívida não está paga.');
    this.name = 'DebtNotPaidError';
  }
}
