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
