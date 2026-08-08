import { financialEntryIdParamSchema } from '@/modules/finance/presentation/http/schemas/financial-entry-id-param.schema';

describe('financialEntryIdParamSchema', () => {
  it('should accept a valid UUID id', () => {
    const result = financialEntryIdParamSchema.safeParse({
      id: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe('4d1af925-d603-4db1-9dde-5c56505101fc');
    }
  });

  it('should reject missing id', () => {
    const result = financialEntryIdParamSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('should reject invalid id', () => {
    const result = financialEntryIdParamSchema.safeParse({
      id: 'entry-1',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Id inválido.');
    }
  });
});
