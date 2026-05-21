import { InvalidCredentialsError } from '@/modules/auth/domain/errors/invalid-credentials.error';

describe('InvalidCredentialsError', () => {
  it('should create error with correct name and message', () => {
    const error = new InvalidCredentialsError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('InvalidCredentialsError');
    expect(error.message).toBe('Credenciais inválidas.');
  });
});
