/**
 * Formata uma data no formato aceito por inputs `type="date"` (YYYY-MM-DD)
 * usando o dia do calendário **local**, e não o de UTC.
 *
 * Usar `toISOString()` converteria para UTC e, em fusos negativos (ex.: UTC-3),
 * no fim da noite o input passaria a mostrar o dia seguinte.
 */
export function formatLocalDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/** Data de hoje em horário local no formato YYYY-MM-DD. */
export function getTodayDateValue(): string {
  return formatLocalDateValue(new Date());
}

const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Data no fuso de negócio do produto (America/Sao_Paulo) no formato
 * YYYY-MM-DD, independente do fuso do processo que executa o código.
 *
 * Necessário para código que roda no servidor: em produção o runtime roda
 * em UTC, então perto da meia-noite local (UTC-3) `new Date().getMonth()`
 * já teria virado o mês seguinte. Usa Intl com timeZone explícito, que
 * resolve o instante real (getTime()) e ignora os getters locais do Date.
 */
export function getCurrentBusinessDateValue(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Quantos dias de calendário faltam para `dueDateValue`, a partir de hoje
 * (horário local). 0 = vence hoje, positivo = no futuro, negativo = já
 * passou. Usa só a parte YYYY-MM-DD da string recebida — mesmo cuidado com
 * fuso do resto do módulo de dívidas (ver `dueDate.slice(0, 7)` em
 * `debt-filters.ts`): nunca reinterpretar a data via `new Date(iso).getDate()`
 * local, pois isso reconverteria o instante UTC para o fuso da máquina.
 */
export function getDaysUntil(dueDateValue: string): number {
  const [todayYear, todayMonth, todayDay] = getTodayDateValue()
    .split('-')
    .map(Number);
  const [dueYear, dueMonth, dueDay] = dueDateValue
    .slice(0, 10)
    .split('-')
    .map(Number);

  const todayUtc = Date.UTC(todayYear, todayMonth - 1, todayDay);
  const dueUtc = Date.UTC(dueYear, dueMonth - 1, dueDay);

  return Math.round((dueUtc - todayUtc) / MILLISECONDS_PER_DAY);
}
