export class WalletNotFoundError extends Error {
  constructor(userId?: string) {
    super(
      userId
        ? `Wallet não encontrada para o usuário "${userId}".`
        : 'Wallet não encontrada.',
    );
    this.name = 'WalletNotFoundError';
  }
}
