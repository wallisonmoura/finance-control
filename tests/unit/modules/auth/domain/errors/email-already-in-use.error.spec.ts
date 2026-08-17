import { EmailAlreadyInUseError } from '@/modules/auth/domain/errors/email-already-in-use.error';

describe('EmailAlreadyInUseError', () => {
  it('should create error with correct name and message', () => {
    const error = new EmailAlreadyInUseError();

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('EmailAlreadyInUseError');
    expect(error.message).toBe('E-mail já está em uso.');
  });
});
