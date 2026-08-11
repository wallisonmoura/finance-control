const BUSINESS_TIME_ZONE = 'America/Sao_Paulo';

/**
 * Current date in the product's business timezone (America/Sao_Paulo), as
 * YYYY-MM-DD, regardless of the timezone the running process is in.
 *
 * Backend/domain equivalent of
 * `shared/presentation/ui/lib/date.ts#getCurrentBusinessDateValue`. Needed
 * because in production the server process runs in UTC: near local
 * midnight (UTC-3), `new Date().getDate()` would already have rolled over
 * to the next day. Uses `Intl` with an explicit timeZone, which resolves
 * the real instant (`getTime()`) and ignores the Date object's local
 * getters.
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
