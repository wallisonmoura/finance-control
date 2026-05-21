export class DefaultWalletNotFoundError extends Error {
  constructor() {
    super('Wallet padrão não encontrada para o usuário.');
    this.name = 'DefaultWalletNotFoundError';
  }
}
