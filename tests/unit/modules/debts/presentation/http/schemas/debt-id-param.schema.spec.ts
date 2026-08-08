import { debtIdParamSchema } from '@/modules/debts/presentation/http/schemas/debt-id-param.schema';

describe('debtIdParamSchema', () => {
  it('should accept a valid UUID id', () => {
    const result = debtIdParamSchema.safeParse({
      id: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe('4d1af925-d603-4db1-9dde-5c56505101fc');
    }
  });

  it('should reject a missing id', () => {
    const result = debtIdParamSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject an invalid id', () => {
    const result = debtIdParamSchema.safeParse({
      id: 'debt-1',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Id inválido.');
    }
  });
});
