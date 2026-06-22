export class InvalidWalletUserIdError extends Error {
  constructor() {
    super('ID do usuário é obrigatório.');
    this.name = 'InvalidWalletUserIdError';
  }
}
