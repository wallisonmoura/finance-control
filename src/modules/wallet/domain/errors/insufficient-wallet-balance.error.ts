export class InsufficientWalletBalanceError extends Error {
  constructor() {
    super('Insufficient wallet balance.');
    this.name = 'InsufficientWalletBalanceError';
  }
}
