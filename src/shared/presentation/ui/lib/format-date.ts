/**
 * Formata uma data ISO (YYYY-MM-DD ou com horário) para exibição em pt-BR
 * (DD/MM/AAAA), interpretando a data em UTC para evitar que o fuso do
 * navegador/servidor desloque o dia exibido.
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

/**
 * Mesma formatação de `formatDate`, mas tolerante a `date` nula/ausente —
 * retorna `fallback` nesse caso, em vez de formatar uma data inválida.
 */
export function formatDateOrFallback(
  date: string | null,
  fallback = '-',
): string {
  if (!date) {
    return fallback;
  }

  return formatDate(date);
}
