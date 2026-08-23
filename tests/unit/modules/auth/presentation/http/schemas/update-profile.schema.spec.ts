import { updateProfileSchema } from '@/modules/auth/presentation/http/schemas/update-profile.schema';

describe('updateProfileSchema', () => {
  const validPayload = {
    name: 'Wallison Moura',
  };

  it('should accept a valid update-profile payload', () => {
    const result = updateProfileSchema.safeParse(validPayload);

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validPayload);
    }
  });

  it('should trim the name', () => {
    const result = updateProfileSchema.safeParse({
      name: '  Wallison Moura  ',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe('Wallison Moura');
    }
  });

  it('should reject a missing name', () => {
    const result = updateProfileSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject an empty name', () => {
    const result = updateProfileSchema.safeParse({ name: '' });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nome é obrigatório');
    }
  });

  it('should reject a name with only whitespace', () => {
    const result = updateProfileSchema.safeParse({ name: '   ' });

    expect(result.success).toBe(false);
  });
});
