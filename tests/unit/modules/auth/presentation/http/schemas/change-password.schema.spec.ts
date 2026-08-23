/* eslint-disable @typescript-eslint/no-unused-vars */
import { changePasswordSchema } from '@/modules/auth/presentation/http/schemas/change-password.schema';

describe('changePasswordSchema', () => {
  const validPayload = {
    currentPassword: 'current-password',
    newPassword: 'new-password-123',
  };

  it('should accept a valid change-password payload', () => {
    const result = changePasswordSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should reject a missing current password', () => {
    const { currentPassword, ...payloadWithoutCurrentPassword } =
      validPayload;

    const result = changePasswordSchema.safeParse(
      payloadWithoutCurrentPassword,
    );

    expect(result.success).toBe(false);
  });

  it('should reject an empty current password', () => {
    const result = changePasswordSchema.safeParse({
      ...validPayload,
      currentPassword: '',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Senha atual é obrigatória',
      );
    }
  });

  it('should reject a missing new password', () => {
    const { newPassword, ...payloadWithoutNewPassword } = validPayload;

    const result = changePasswordSchema.safeParse(payloadWithoutNewPassword);

    expect(result.success).toBe(false);
  });

  it('should reject a new password shorter than 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      ...validPayload,
      newPassword: '1234567',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'A nova senha deve ter pelo menos 8 caracteres',
      );
    }
  });

  it('should accept a new password with exactly 8 characters', () => {
    const result = changePasswordSchema.safeParse({
      ...validPayload,
      newPassword: '12345678',
    });

    expect(result.success).toBe(true);
  });
});
