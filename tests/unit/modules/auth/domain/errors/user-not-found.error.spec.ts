import { UserNotFoundError } from '@/modules/auth/domain/errors/user-not-found.error';

describe('UserNotFoundError', () => {
  it('should create a generic error when no userId is given', () => {
    const error = new UserNotFoundError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('UserNotFoundError');
    expect(error.message).toBe('Usuário não encontrado.');
  });

  it('should include the userId in the message when given', () => {
    const error = new UserNotFoundError('user-1');

    expect(error.message).toBe('Usuário não encontrado para o id "user-1".');
  });
});
