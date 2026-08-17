/* eslint-disable @typescript-eslint/no-unused-vars */
import { signUpSchema } from '@/modules/auth/presentation/http/schemas/sign-up.schema';

describe('signUpSchema', () => {
  const validPayload = {
    name: 'Nova Usuária',
    email: 'nova@email.com',
    password: '12345678',
  };

  it('should accept a valid sign-up payload', () => {
    const result = signUpSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should trim the name', () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      name: '  Nova Usuária  ',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Nova Usuária');
    }
  });

  it('should reject a missing name', () => {
    const { name, ...payloadWithoutName } = validPayload;

    const result = signUpSchema.safeParse(payloadWithoutName);

    expect(result.success).toBe(false);
  });

  it('should reject an empty name', () => {
    const result = signUpSchema.safeParse({ ...validPayload, name: '' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome é obrigatório');
    }
  });

  it('should reject a name with only whitespace', () => {
    const result = signUpSchema.safeParse({ ...validPayload, name: '   ' });

    expect(result.success).toBe(false);
  });

  it('should reject an invalid email', () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      email: 'email-invalido',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('E-mail inválido');
    }
  });

  it('should reject a missing password', () => {
    const { password, ...payloadWithoutPassword } = validPayload;

    const result = signUpSchema.safeParse(payloadWithoutPassword);

    expect(result.success).toBe(false);
  });

  it('should reject a password shorter than 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: '1234567',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'A senha deve ter pelo menos 8 caracteres',
      );
    }
  });

  it('should accept a password with exactly 8 characters', () => {
    const result = signUpSchema.safeParse({
      ...validPayload,
      password: '12345678',
    });

    expect(result.success).toBe(true);
  });
});
