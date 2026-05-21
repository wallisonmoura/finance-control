export class InsufficientWalletBalanceError extends Error {
  constructor() {
    super('Saldo insuficiente na Wallet.');
    this.name = 'InsufficientWalletBalanceError';
  }
}
