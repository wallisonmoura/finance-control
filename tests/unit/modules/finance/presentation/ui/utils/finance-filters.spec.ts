import {
  getCurrentMonthFilters,
  getFinanceHistoryFiltersFromSearchParamsRecord,
  getFinanceHistoryFiltersFromUrlSearchParams,
  isValidCategoryId,
} from '@/modules/finance/presentation/ui/utils/finance-filters';

describe('getCurrentMonthFilters', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('usa o mês do fuso de negócio (America/Sao_Paulo), não o do processo, perto da meia-noite', () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor em
    // produção): o filtro não pode "virar" para agosto enquanto ainda é
    // 31/07 no fuso de negócio.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T22:38:00-03:00'));
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(7); // agosto (0-based)

    const filters = getCurrentMonthFilters();

    expect(filters.startDate).toBe('2026-07-01');
    expect(filters.endDate).toBe('2026-07-31');
  });
});

describe('isValidCategoryId', () => {
  it('aceita UUID válido', () => {
    expect(isValidCategoryId('11111111-1111-4111-8111-111111111111')).toBe(
      true,
    );
  });

  it('rejeita valor não-UUID e null', () => {
    expect(isValidCategoryId('abc')).toBe(false);
    expect(isValidCategoryId(null)).toBe(false);
  });

  it('rejeita UUID com formato hexadecimal correto mas versão inválida', () => {
    // Uma checagem apenas hexadecimal aceitaria este valor, mas a API usa
    // z.uuid() e responderia 400. UI e API precisam concordar.
    expect(isValidCategoryId('11111111-1111-1111-1111-111111111111')).toBe(
      false,
    );
  });
});

describe('parsing de categoryId nos filtros', () => {
  it('inclui categoryId a partir de URLSearchParams quando válido', () => {
    const params = new URLSearchParams({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      type: 'EXPENSE',
      categoryId: '11111111-1111-4111-8111-111111111111',
    });

    const filters = getFinanceHistoryFiltersFromUrlSearchParams(params);

    expect(filters.categoryId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('ignora categoryId inválido no record de search params', () => {
    const filters = getFinanceHistoryFiltersFromSearchParamsRecord({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      categoryId: 'not-a-uuid',
    });

    expect(filters.categoryId).toBeUndefined();
  });
});
