export class InvalidExpenseCategoryUserIdError extends Error {
  constructor() {
    super('ID do usuário é obrigatório.');
    this.name = 'InvalidExpenseCategoryUserIdError';
  }
}
