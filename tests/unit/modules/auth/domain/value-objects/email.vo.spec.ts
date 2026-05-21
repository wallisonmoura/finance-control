import { Email } from '@/modules/auth/domain/value-objects/email.vo';

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const email = Email.create('wallison@email.com');

    expect(email.getValue()).toBe('wallison@email.com');
  });

  it('should normalize email by trimming and lowercasing', () => {
    const email = Email.create('  WALLISON@EMAIL.COM  ');

    expect(email.getValue()).toBe('wallison@email.com');
  });

  it('should throw an error when email is invalid', () => {
    expect(() => Email.create('email-invalido')).toThrow('E-mail inválido.');
  });

  it('should throw an error when email is empty', () => {
    expect(() => Email.create('')).toThrow('E-mail inválido.');
  });

  it('should throw an error when email has only spaces', () => {
    expect(() => Email.create('   ')).toThrow('E-mail inválido.');
  });
});
