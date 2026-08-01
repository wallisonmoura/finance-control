import {
  formatLocalDateValue,
  getCurrentBusinessDateValue,
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

describe('getCurrentBusinessDateValue', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('resolve o dia de calendário do fuso do produto (America/Sao_Paulo), não o do processo', () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor
    // rodando em produção), mockando apenas Date.prototype — a função deve
    // ignorar esses getters e usar Intl com timeZone explícito.
    const instant = new Date('2026-07-31T22:38:00-03:00');
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(7); // agosto (0-based)
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(1);

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-07-31');
  });

  it('resolve o ano correto na virada de ano, mesmo quando o processo já leria o ano seguinte', () => {
    // 23:10 em São Paulo (31/12/2026) já é 02:10 UTC de 01/01/2027 — a
    // variante mais grave deste bug, que erraria mês e ano juntos.
    const instant = new Date('2026-12-31T23:10:00-03:00');
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2027);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // janeiro (0-based)
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(1);

    expect(getCurrentBusinessDateValue(instant)).toBe('2026-12-31');
  });

  it('usa a data atual quando nenhuma data é passada', () => {
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

  it('não conta um dia a mais quando o processo já leria o dia seguinte (fuso do produto ainda não virou)', () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor em
    // produção, no SSR do sino de dívidas vencendo em breve): se
    // getDaysUntil usasse esses getters, uma dívida que vence em 3 dias
    // (real, no fuso de negócio) apareceria como vencendo em 2 — cruzando o
    // limite de "vencendo em breve" um dia antes da hora.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T22:38:00-03:00'));
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(7); // agosto (0-based)
    jest.spyOn(Date.prototype, 'getDate').mockReturnValue(1);

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
