export class UserNotFoundError extends Error {
  constructor(userId?: string) {
    super(
      userId
        ? `Usuário não encontrado para o id "${userId}".`
        : 'Usuário não encontrado.',
    );
    this.name = 'UserNotFoundError';
  }
}
