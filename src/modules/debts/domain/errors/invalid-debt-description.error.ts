export class InvalidDebtDescriptionError extends Error {
  constructor() {
    super('Descrição da dívida é obrigatória.');
    this.name = 'InvalidDebtDescriptionError';
  }
}
