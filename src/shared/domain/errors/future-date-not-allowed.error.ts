export class FutureDateNotAllowedError extends Error {
  constructor() {
    super('Data não pode ser uma data futura.');
    this.name = 'FutureDateNotAllowedError';
  }
}
