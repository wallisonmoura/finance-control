export class DebtTypeChangeNotAllowedError extends Error {
  constructor() {
    super('Uma dívida parcelada não muda de tipo, e outra dívida não pode virar parcelada.');
    this.name = 'DebtTypeChangeNotAllowedError';
  }
}
