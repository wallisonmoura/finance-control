import { financeAmountSchema } from '@/modules/finance/presentation/http/schemas/shared/finance-amount.schema';

describe('financeAmountSchema', () => {
  it('deve aceitar valor numérico positivo', () => {
    const result = financeAmountSchema.safeParse(100);

    expect(result.success).toBe(true);
    expect(result.data).toBe(100);
  });

  it('deve converter string numérica válida para number', () => {
    const result = financeAmountSchema.safeParse('100.50');

    expect(result.success).toBe(true);
    expect(result.data).toBe(100.5);
  });

  it('deve rejeitar valor zero', () => {
    const result = financeAmountSchema.safeParse(0);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ser maior que zero.',
      );
    }
  });

  it('deve rejeitar valor negativo', () => {
    const result = financeAmountSchema.safeParse(-10);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ser maior que zero.',
      );
    }
  });

  it('deve rejeitar valor não numérico', () => {
    const result = financeAmountSchema.safeParse('abc');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Valor deve ser numérico.');
    }
  });

  it('deve rejeitar valor com mais de 2 casas decimais', () => {
    const result = financeAmountSchema.safeParse(10.999);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor deve ter no máximo 2 casas decimais.',
      );
    }
  });

  it('deve rejeitar valor acima do limite permitido', () => {
    const result = financeAmountSchema.safeParse(1000000000000);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Valor excede o limite permitido.',
      );
    }
  });
});
