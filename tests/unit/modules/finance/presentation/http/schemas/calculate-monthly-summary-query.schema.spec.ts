import { calculateMonthlySummaryQuerySchema } from '@/modules/finance/presentation/http/schemas/calculate-monthly-summary-query.schema';

describe('calculateMonthlySummaryQuerySchema', () => {
  it('deve aceitar year com 4 dígitos e month sem zero à esquerda', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '3',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        year: '2026',
        month: '3',
      });
    }
  });

  it('deve aceitar month com zero à esquerda', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '03',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.month).toBe('03');
    }
  });

  it('deve rejeitar year ausente', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      month: '3',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar month ausente', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar year com menos de 4 dígitos', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '26',
      month: '3',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar month menor que 1', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '0',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar month maior que 12', () => {
    const result = calculateMonthlySummaryQuerySchema.safeParse({
      year: '2026',
      month: '13',
    });

    expect(result.success).toBe(false);
  });
});
