export class DebtAlreadyPaidError extends Error {
  constructor() {
    super('Dívida já está paga.');
    this.name = 'DebtAlreadyPaidError';
  }
}
