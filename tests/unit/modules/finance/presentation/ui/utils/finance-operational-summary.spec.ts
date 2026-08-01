import { getCurrentOperationalSummaryFilters } from '@/modules/finance/presentation/ui/utils/finance-operational-summary';

describe('getCurrentOperationalSummaryFilters', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('usa o mês do fuso de negócio (America/Sao_Paulo), não o do processo, perto da meia-noite', () => {
    // 22:38 em São Paulo (31/07) já é 01:38 UTC do dia seguinte (01/08).
    // Simula um processo cujos getters locais leem em UTC (ex.: servidor em
    // produção): o resumo não pode "virar" para agosto enquanto ainda é
    // 31/07 no fuso de negócio.
    jest.useFakeTimers().setSystemTime(new Date('2026-07-31T22:38:00-03:00'));
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2026);
    jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(7); // agosto (0-based)

    const filters = getCurrentOperationalSummaryFilters();

    expect(filters).toEqual({ year: 2026, month: 7 });
  });
});
