import {
  formatLocalDateValue,
  getCurrentBusinessDateValue,
  getDaysUntil,
  getTodayDateValue,
} from '@/shared/presentation/ui/lib/date';

/**
 * Simula um processo cujos getters locais de Date leem como se estivessem
 * em UTC (o pior caso: servidor de produção) — usado para provar que
 * funções do fuso de negócio (Intl com timeZone explícito) ignoram esses
 * getters e resolvem o dia certo mesmo assim.
 */
function mockDateGettersAsIfUtc(
  year: number,
  monthIndex: number,
  day: number,
): void {
  jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(year);
  jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(monthIndex);
  jest.spyOn(Date.prototype, 'getDate').mockReturnValue(day);
}

describe('formatLocalDateValue', () => {
  it('should use the local date components, not UTC', () => {
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

  it('should format month and day with a leading zero', () => {
    const localDate = {
      getFullYear: () => 2026,
      getMonth: () => 2, // março (0-based)
      getDate: () => 5,
    } as unknown as Date;

    expect(formatLocalDateValue(localDate)).toBe('2026-03-05');
  });
});

describe('getTodayDateValue', () => {
  it('should return today\'s date in local time as YYYY-MM-DD', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    expect(getTodayDateValue()).toBe(expected);
  });
});

describe('getCurrentBusinessDateValue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should resolve the product timezone's (America/Sao_Paulo) calendar day, not the process's", () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor
    // rodando em produção), mockando apenas Date.prototype — a função deve
    // ignorar esses getters e usar Intl com timeZone explícito.
    const instant = new Date('2026-07-31T22:38:00-03:00');
    mockDateGettersAsIfUtc(2026, 7, 1); // "01/08" (agosto, 0-based)

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-07-31');
  });

  it('should resolve the correct year at year-end, even when the process would already read the next year', () => {
    // 23:10 em São Paulo (31/12/2026) já é 02:10 UTC de 01/01/2027 — a
    // variante mais grave deste bug, que erraria mês e ano juntos.
    const instant = new Date('2026-12-31T23:10:00-03:00');
    mockDateGettersAsIfUtc(2027, 0, 1); // "01/01/2027" (janeiro, 0-based)

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-12-31');
  });

  it('should use the current date when no date is passed', () => {
    const now = new Date();
    const expected = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(now);

    expect(getCurrentBusinessDateValue()).toBe(expected);
  });
});

describe('getDaysUntil', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should not count an extra day when the process would already read the next day (product timezone hasn't rolled over yet)", () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor em
    // produção, no SSR do sino de dívidas vencendo em breve): se
    // getDaysUntil usasse esses getters, uma dívida que vence em 3 dias
    // (real, no fuso de negócio) apareceria como vencendo em 2 — cruzando o
    // limite de "vencendo em breve" um dia antes da hora.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T22:38:00-03:00'));
    mockDateGettersAsIfUtc(2026, 7, 1); // "01/08" (agosto, 0-based)

    expect(getDaysUntil('2026-08-03')).toBe(3);
  });

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

  it('should return 0 when the date is today', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(0))).toBe(0);
  });

  it('should return the number of days remaining until a future date', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(2))).toBe(2);
  });

  it('should return a negative number for a date that has already passed', () => {
    expect(getDaysUntil(buildIsoDateOffsetFromToday(-3))).toBe(-3);
  });

  it('should only consider the date part (YYYY-MM-DD) of the ISO string, ignoring the time', () => {
    const now = new Date();
    const dueDateWithTime = new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 59),
    ).toISOString();

    expect(getDaysUntil(dueDateWithTime)).toBe(1);
  });
});
