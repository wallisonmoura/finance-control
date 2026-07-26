import {
  filterDebtsByMonth,
  formatMonthLabel,
  getCurrentMonthValue,
  getDebtsMonthFromUrlSearchParams,
  getNextMonthValue,
  getPreviousMonthValue,
  isValidMonthValue,
} from '@/modules/debts/presentation/ui/utils/debt-filters';
import { DebtUi } from '@/modules/debts/presentation/ui/types/debt-ui.types';

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
  it('aceita valor no formato YYYY-MM', () => {
    expect(isValidMonthValue('2026-07')).toBe(true);
  });

  it('rejeita formato inválido', () => {
    expect(isValidMonthValue('2026-7')).toBe(false);
    expect(isValidMonthValue('2026-13')).toBe(false);
    expect(isValidMonthValue('2026-00')).toBe(false);
    expect(isValidMonthValue('2026/07')).toBe(false);
    expect(isValidMonthValue(null)).toBe(false);
  });
});

describe('getPreviousMonthValue / getNextMonthValue', () => {
  it('avança um mês dentro do mesmo ano', () => {
    expect(getNextMonthValue('2026-07')).toBe('2026-08');
  });

  it('volta um mês dentro do mesmo ano', () => {
    expect(getPreviousMonthValue('2026-07')).toBe('2026-06');
  });

  it('cruza a virada de ano ao avançar de dezembro', () => {
    expect(getNextMonthValue('2026-12')).toBe('2027-01');
  });

  it('cruza a virada de ano ao voltar de janeiro', () => {
    expect(getPreviousMonthValue('2026-01')).toBe('2025-12');
  });
});

describe('formatMonthLabel', () => {
  it('formata o mês por extenso em pt-BR', () => {
    expect(formatMonthLabel('2026-07')).toBe('Julho de 2026');
  });

  it('não sofre deslocamento de fuso horário nas bordas do ano', () => {
    // Regressão do bug corrigido no PR #7: interpretar a data-mês em UTC,
    // nunca deixando new Date(...).getMonth() aplicar o fuso local.
    expect(formatMonthLabel('2026-01')).toBe('Janeiro de 2026');
    expect(formatMonthLabel('2026-12')).toBe('Dezembro de 2026');
  });
});

describe('getDebtsMonthFromUrlSearchParams', () => {
  it('lê o mês da URL quando válido', () => {
    const params = new URLSearchParams({ month: '2026-03' });

    expect(getDebtsMonthFromUrlSearchParams(params)).toBe('2026-03');
  });

  it('cai no mês atual quando ausente ou inválido', () => {
    expect(getDebtsMonthFromUrlSearchParams(new URLSearchParams())).toBe(
      getCurrentMonthValue(),
    );
    expect(
      getDebtsMonthFromUrlSearchParams(new URLSearchParams({ month: 'abc' })),
    ).toBe(getCurrentMonthValue());
  });
});

describe('filterDebtsByMonth', () => {
  it('inclui dívida com vencimento no mês selecionado', () => {
    const debt = buildDebt({ dueDate: '2026-07-15T00:00:00.000Z' });

    expect(filterDebtsByMonth([debt], '2026-07', '2026-07')).toEqual([debt]);
  });

  it('exclui dívida com vencimento em outro mês', () => {
    const debt = buildDebt({ dueDate: '2026-08-01T00:00:00.000Z' });

    expect(filterDebtsByMonth([debt], '2026-07', '2026-07')).toEqual([]);
  });

  it('inclui pendente vencida de mês anterior quando o filtro é o mês atual real', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2026-06-10T00:00:00.000Z',
    });

    expect(filterDebtsByMonth([overdue], '2026-07', '2026-07')).toEqual([
      overdue,
    ]);
  });

  it('não inclui pendente vencida ao navegar para um mês que não é o atual real', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2026-05-10T00:00:00.000Z',
    });

    // filtro=2026-06, mas o mês atual real (referenceMonth) é 2026-07
    expect(filterDebtsByMonth([overdue], '2026-06', '2026-07')).toEqual([]);
  });

  it('não inclui dívida paga vencida em mês anterior mesmo no mês atual real', () => {
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

  it('filtra por dueDate, não por paidAt', () => {
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

  it('usa o mês atual real por padrão quando referenceMonth não é informado', () => {
    const overdue = buildDebt({
      status: 'PENDING',
      dueDate: '2020-01-01T00:00:00.000Z',
    });

    expect(filterDebtsByMonth([overdue], getCurrentMonthValue())).toEqual([
      overdue,
    ]);
  });
});
