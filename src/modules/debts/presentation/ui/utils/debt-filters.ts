import { DebtUi } from '../types/debt-ui.types';

const MONTH_ONLY_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Mês atual (YYYY-MM) em horário local — nunca via toISOString(). */
export function getCurrentMonthValue(): string {
  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function isValidMonthValue(value: string | null): value is string {
  if (!value) {
    return false;
  }

  return MONTH_ONLY_REGEX.test(value);
}

export function getPreviousMonthValue(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const isJanuary = monthNumber === 1;

  const previousYear = isJanuary ? year - 1 : year;
  const previousMonthNumber = isJanuary ? 12 : monthNumber - 1;

  return `${previousYear}-${String(previousMonthNumber).padStart(2, '0')}`;
}

export function getNextMonthValue(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const isDecember = monthNumber === 12;

  const nextYear = isDecember ? year + 1 : year;
  const nextMonthNumber = isDecember ? 1 : monthNumber + 1;

  return `${nextYear}-${String(nextMonthNumber).padStart(2, '0')}`;
}

/**
 * Formata "YYYY-MM" por extenso em pt-BR (ex.: "Julho de 2026").
 * Constrói a data em UTC e formata com timeZone: 'UTC' para não sofrer
 * deslocamento de fuso horário nas bordas do mês (mesmo cuidado do PR #7).
 */
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1, 1));

  const label = new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getDebtsMonthFromUrlSearchParams(
  searchParams: URLSearchParams,
): string {
  const month = searchParams.get('month');

  return isValidMonthValue(month) ? month : getCurrentMonthValue();
}

/**
 * Uma dívida aparece quando:
 * - dueDate cai no mês selecionado, OU
 * - está PENDING, dueDate é anterior ao mês selecionado, E o mês
 *   selecionado é o mês atual real (referenceMonth) — pendências vencidas
 *   só "grudam" na visão do mês corrente, não ao navegar para outros meses.
 */
export function filterDebtsByMonth(
  debts: DebtUi[],
  month: string,
  referenceMonth: string = getCurrentMonthValue(),
): DebtUi[] {
  const isViewingCurrentMonth = month === referenceMonth;

  return debts.filter((debt) => {
    const dueDateMonth = debt.dueDate.slice(0, 7);

    if (dueDateMonth === month) {
      return true;
    }

    return (
      isViewingCurrentMonth &&
      debt.status === 'PENDING' &&
      dueDateMonth < month
    );
  });
}
