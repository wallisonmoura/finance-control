export class InvalidDebtAmountError extends Error {
  constructor() {
    super('Valor da dívida deve ser maior que zero.');
    this.name = 'InvalidDebtAmountError';
  }
}
