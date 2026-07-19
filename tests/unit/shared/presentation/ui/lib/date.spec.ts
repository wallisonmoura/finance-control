import {
  formatLocalDateValue,
  getTodayDateValue,
} from '@/shared/presentation/ui/lib/date';

const ORIGINAL_TZ = process.env.TZ;

describe('formatLocalDateValue', () => {
  beforeAll(() => {
    // Fixa um fuso negativo (UTC-3) para reproduzir a virada de dia à noite.
    process.env.TZ = 'America/Sao_Paulo';
  });

  afterAll(() => {
    process.env.TZ = ORIGINAL_TZ;
  });

  it('usa o dia do calendário local, não o de UTC, perto da meia-noite', () => {
    // 2026-07-19T02:26Z equivale a 2026-07-18 23:26 em America/Sao_Paulo.
    const instant = new Date('2026-07-19T02:26:00.000Z');

    expect(formatLocalDateValue(instant)).toBe('2026-07-18');
  });

  it('formata mês e dia com zero à esquerda', () => {
    const instant = new Date('2026-03-05T12:00:00.000Z');

    expect(formatLocalDateValue(instant)).toBe('2026-03-05');
  });
});

describe('getTodayDateValue', () => {
  it('retorna a data de hoje em horário local no formato YYYY-MM-DD', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    expect(getTodayDateValue()).toBe(expected);
  });
});
