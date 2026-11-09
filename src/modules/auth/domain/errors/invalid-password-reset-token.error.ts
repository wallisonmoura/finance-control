// Unknown, expired and already used links get the same message on purpose.
export class InvalidPasswordResetTokenError extends Error {
  constructor() {
    super('Este link expirou ou já foi usado.');
    this.name = 'InvalidPasswordResetTokenError';
  }
}
