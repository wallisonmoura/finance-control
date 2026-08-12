import {
  filterDebtsByMonth,
  formatMonthLabel,
  getCurrentMonthValue,
  getDebtsMonthFromUrlSearchParams,
  getNextMonthValue,
  getPreviousMonthValue,
  isValidMonthValue,
} from '@/modules/debts/presentation/ui/utils/debt-filters';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debts-ui.types';

function buildDebt(overrides: Partial<DebtUi> = {}): DebtUi {
  return {
    id: 'debt-id',
    userId: 'user-id',
    description: 'Dívida',
    amount: 100,
    dueDate: '2026-07-15T00:00:00.000Z',
    type: 'ONE_TIME',
    status: 'PENDING',
    notes: null,
    paidAt: null,
    paymentSource: null,
    createdAt: '2026-07-01T00:00:00.000Z',
    updatedAt: '2026-07-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isValidMonthValue', () => {
  it('accepts a value in YYYY-MM format', () => {
    expect(isValidMonthValue('2026-07')).toBe(true);
  });

  it('rejects an invalid format', () => {
    expect(isValidMonthValue('2026-7')).toBe(false);
    expect(isValidMonthValue('2026-13')).toBe(false);
    expect(isValidMonthValue('2026-00')).toBe(false);
    expect(isValidMonthValue('2026/07')).toBe(false);
    expect(isValidMonthValue(null)).toBe(false);
  });
});

describe('getPreviousMonthValue / getNextMonthValue', () => {
  it('advances one month within the same year', () => {
    expect(getNextMonthValue('2026-07')).toBe('2026-08');
  });

  it('goes back one month within the same year', () => {
    expect(getPreviousMonthValue('2026-07')).toBe('2026-06');
  });

  it('crosses the year boundary when advancing from December', () => {
    expect(getNextMonthValue('2026-12')).toBe('2027-01');
  });

  it('crosses the year boundary when going back from January', () => {
    expect(getPreviousMonthValue('2026-01')).toBe('2025-12');
  });
});

describe('formatMonthLabel', () => {
  it('formats the month name in pt-BR', () => {
    expect(formatMonthLabel('2026-07')).toBe('Julho de 2026');
  });

  it('does not suffer timezone offset at year boundaries', () => {
    // Regressão do bug corrigido no PR #7: interpretar a data-mês em UTC,
    // nunca deixando new Date(...).getMonth() aplicar o fuso local.
    expect(formatMonthLabel('2026-01')).toBe('Janeiro de 2026');
    expect(formatMonthLabel('2026-12')).toBe('Dezembro de 2026');
  });
});

describe('getDebtsMonthFromUrlSearchParams', () => {
  it('reads the month from the URL when valid', () => {
    const params = new URLSearchParams({ month: '2026-03' });

    expect(getDebtsMonthFromUrlSearchParams(params)).toBe('2026-03');
  });

  it('falls back to the current month when missing or invalid', () => {
    expect(getDebtsMonthFromUrlSearchParams(new URLSearchParams())).toBe(
      getCurrentMonthValue(),
    );
    expect(
      getDebtsMonthFromUrlSearchParams(new URLSearchParams({ month: 'abc' })),
    ).toBe(getCurrentMonthValue());
  });
});

describe('filterDebtsByMonth', () => {
  it('includes a debt due in the selected month', () => {
    const debt = buildDebt({ dueDate: '2026-07-15T00:00:00.000Z' });

    expect(filterDebtsByMonth([debt], '2026-07', '2026-07')).toEqual([debt]);
  });

  it('excludes a debt due in another month', () => {
    const debt = buildDebt({ dueDate: '2026-08-01T00:00:00.000Z' });

    expect(filterDebtsByMonth([debt], '2026-07', '2026-07')).toEqual([]);
  });

  it('includes an overdue pending debt from a previous month when the filter is the real current month', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2026-06-10T00:00:00.000Z',
    });

    expect(filterDebtsByMonth([overdue], '2026-07', '2026-07')).toEqual([
      overdue,
    ]);
  });

  it('does not include an overdue pending debt when navigating to a month that is not the real current one', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2026-05-10T00:00:00.000Z',
    });

    // filtro=2026-06, mas o mês atual real (referenceMonth) é 2026-07
    expect(filterDebtsByMonth([overdue], '2026-06', '2026-07')).toEqual([]);
  });

  it('does not include a paid debt overdue in a previous month even in the real current month', () => {
    const paidOverdue = buildDebt({
      status: 'PAID',
      dueDate: '2026-06-10T00:00:00.000Z',
      paidAt: '2026-06-12T00:00:00.000Z',
      paymentSource: 'BANK',
    });

    expect(filterDebtsByMonth([paidOverdue], '2026-07', '2026-07')).toEqual(
      [],
    );
  });

  it('filters by dueDate, not by paidAt', () => {
    const paidInMonth = buildDebt({
      status: 'PAID',
      dueDate: '2026-07-05T00:00:00.000Z',
      paidAt: '2026-08-02T00:00:00.000Z',
      paymentSource: 'CASH',
    });
    const paidOutsideMonth = buildDebt({
      id: 'other-debt',
      status: 'PAID',
      dueDate: '2026-08-05T00:00:00.000Z',
      paidAt: '2026-07-02T00:00:00.000Z',
      paymentSource: 'CASH',
    });

    const result = filterDebtsByMonth(
      [paidInMonth, paidOutsideMonth],
      '2026-07',
      '2026-07',
    );

    expect(result).toEqual([paidInMonth]);
  });

  it('uses the real current month by default when referenceMonth is not provided', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    expect(filterDebtsByMonth([overdue], getCurrentMonthValue())).toEqual([
      overdue,
    ]);
  });
});
