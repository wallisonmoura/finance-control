export class InvalidDebtDescriptionError extends Error {
  constructor() {
    super('Debt description is required.');
    this.name = 'InvalidDebtDescriptionError';
  }
}
