import { debtIdParamSchema } from '@/modules/debts/presentation/http/schemas/debt-id-param.schema';

describe('debtIdParamSchema', () => {
  it('deve aceitar id UUID válido', () => {
    const result = debtIdParamSchema.safeParse({
      id: '4d1af925-d603-4db1-9dde-5c56505101fc',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe('4d1af925-d603-4db1-9dde-5c56505101fc');
    }
  });

  it('deve rejeitar id ausente', () => {
    const result = debtIdParamSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it('deve rejeitar id inválido', () => {
    const result = debtIdParamSchema.safeParse({
      id: 'debt-1',
    });

    expect(result.success).toBe(false);
  });
});
