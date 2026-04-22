export class WalletNotFoundError extends Error {
  constructor(userId?: string) {
    super(
      userId ? `Wallet not found for user "${userId}".` : 'Wallet not found.',
    );
    this.name = 'WalletNotFoundError';
  }
}
