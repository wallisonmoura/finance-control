export class EmailAlreadyInUseError extends Error {
  constructor() {
    super('E-mail já está em uso.');
    this.name = 'EmailAlreadyInUseError';
  }
}
