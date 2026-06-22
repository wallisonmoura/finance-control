export class InvalidFinancialEntryUserIdError extends Error {
  constructor() {
    super('ID do usuário é obrigatório.');
    this.name = 'InvalidFinancialEntryUserIdError';
  }
}
