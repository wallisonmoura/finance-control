import {
  formatLocalDateValue,
  getDaysUntil,
  getTodayDateValue,
} from '@/shared/presentation/ui/lib/date';

describe('formatLocalDateValue', () => {
  it('usa os componentes locais da data, não os de UTC', () => {
    // Data "fake" que só expõe os getters locais. Garante que a função use
    // getFullYear/getMonth/getDate — e não toISOString(), que converteria
    // para UTC e adiantaria o dia em fusos negativos no fim da noite.
    const localDate = {
      getFullYear: () => 2026,
      getMonth: () => 6, // julho (0-based)
      getDate: () => 18,
    } as unknown as Date;

    expect(formatLocalDateValue(localDate)).toBe('2026-07-18');
  });

  it('formata mês e dia com zero à esquerda', () => {
    const localDate = {
      getFullYear: () => 2026,
      getMonth: () => 2, // março (0-based)
      getDate: () => 5,
    } as unknown as Date;

    expect(formatLocalDateValue(localDate)).toBe('2026-03-05');
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

describe('getDaysUntil', () => {
  function buildIsoDateOffsetFromToday(daysFromToday: number): string {
    const now = new Date();

    return new Date(
      Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysFromToday,
      ),
    ).toISOString();
  }

  it('retorna 0 quando a data é hoje', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(0))).toBe(0);
  });

  it('retorna a quantidade de dias que faltam para uma data futura', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(2))).toBe(2);
  });

  it('retorna um número negativo para uma data que já passou', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(-3))).toBe(-3);
  });

  it('considera só a parte de data (YYYY-MM-DD) da string ISO, ignorando o horário', () => {
    const now = new Date();
    const dueDateWithTime = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59),
    ).toISOString();

    expect(getDaysUntil(dueDateWithTime)).toBe(1);
  });
});
