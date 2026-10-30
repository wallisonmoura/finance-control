export class InstallmentDebtCreationNotAllowedError extends Error {
  constructor() {
    super('Dívidas parceladas só podem ser criadas pelo parcelamento.');
    this.name = 'InstallmentDebtCreationNotAllowedError';
  }
}
