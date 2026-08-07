export class InvalidUserNameError extends Error {
  constructor() {
    super('Nome do usuário é obrigatório.');
    this.name = 'InvalidUserNameError';
  }
}
