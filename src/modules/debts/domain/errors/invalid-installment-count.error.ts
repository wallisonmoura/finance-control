export class InvalidInstallmentCountError extends Error {
  constructor() {
    super('Número de parcelas deve ser um número inteiro entre 2 e 12.');
    this.name = 'InvalidInstallmentCountError';
  }
}
