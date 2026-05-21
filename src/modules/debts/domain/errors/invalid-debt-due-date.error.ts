export class InvalidDebtDueDateError extends Error {
  constructor() {
    super('Data de vencimento da dívida é obrigatória e deve ser válida.');
    this.name = 'InvalidDebtDueDateError';
  }
}
