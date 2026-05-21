import { isoDateStringSchema } from '@/modules/finance/presentation/http/schemas/shared/date-query.schema';

describe('isoDateStringSchema', () => {
  it('deve aceitar data no formato YYYY-MM-DD', () => {
    const result = isoDateStringSchema.safeParse('2026-03-23');

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toBe('2026-03-23');
    }
  });

  it('deve rejeitar data no formato DD/MM/YYYY', () => {
    const result = isoDateStringSchema.safeParse('23/03/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('deve rejeitar datetime completo', () => {
    const result = isoDateStringSchema.safeParse('2026-03-23T10:00:00Z');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('deve rejeitar valor que não seja string', () => {
    const result = isoDateStringSchema.safeParse(20260323);

    expect(result.success).toBe(false);
  });
});
