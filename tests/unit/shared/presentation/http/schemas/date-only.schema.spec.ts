import { dateOnlySchema } from '@/shared/presentation/http/schemas/date-only.schema';

describe('dateOnlySchema', () => {
  it('deve aceitar uma data válida no formato YYYY-MM-DD', () => {
    const result = dateOnlySchema.safeParse('2026-03-23');

    expect(result.success).toBe(true);
    expect(result.data).toBe('2026-03-23');
  });

  it('deve remover espaços antes de validar a data', () => {
    const result = dateOnlySchema.safeParse(' 2026-03-23 ');

    expect(result.success).toBe(true);
    expect(result.data).toBe('2026-03-23');
  });

  it('deve rejeitar valor undefined', () => {
    const result = dateOnlySchema.safeParse(undefined);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data é obrigatória.');
    }
  });

  it('deve rejeitar valor que não seja string', () => {
    const result = dateOnlySchema.safeParse(123);

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data deve ser uma string.');
    }
  });

  it('deve rejeitar data fora do formato YYYY-MM-DD', () => {
    const result = dateOnlySchema.safeParse('23/03/2026');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('deve rejeitar datetime completo', () => {
    const result = dateOnlySchema.safeParse('2026-03-23T10:00:00Z');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data deve estar no formato YYYY-MM-DD.',
      );
    }
  });

  it('deve rejeitar data inexistente', () => {
    const result = dateOnlySchema.safeParse('2026-02-30');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });

  it('deve rejeitar mês inválido', () => {
    const result = dateOnlySchema.safeParse('2026-13-01');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });

  it('deve rejeitar dia inválido', () => {
    const result = dateOnlySchema.safeParse('2026-04-31');

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Data inválida.');
    }
  });
});
