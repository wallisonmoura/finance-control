export class InvalidDebtUserIdError extends Error {
  constructor() {
    super('ID do usuário é obrigatório.');
    this.name = 'InvalidDebtUserIdError';
  }
}
