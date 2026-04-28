export class DefaultWalletNotFoundError extends Error {
  constructor() {
    super('Default wallet not found for user.');
    this.name = 'DefaultWalletNotFoundError';
  }
}
