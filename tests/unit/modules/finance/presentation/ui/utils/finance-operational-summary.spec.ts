import { getCurrentOperationalSummaryFilters } from '@/modules/finance/presentation/ui/utils/finance-operational-summary';
import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

// A resolução do dia no fuso de negócio (independente do fuso do servidor)
// já é coberta em date.spec.ts. Aqui mockamos o valor para testar só a
// conversão para { year, month }.
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: jest.fn(() => '2026-01-15'),
}));

const mockedGetCurrentBusinessDateValue =
  getCurrentBusinessDateValue as jest.Mock;

describe('getCurrentOperationalSummaryFilters', () => {
  it('should derive { year, month } from the current business day', () => {
    mockedGetCurrentBusinessDateValue.mockReturnValueOnce('2026-07-31');

    expect(getCurrentOperationalSummaryFilters()).toEqual({
      year: 2026,
      month: 7,
    });
  });

  it('should handle the year change correctly', () => {
    mockedGetCurrentBusinessDateValue.mockReturnValueOnce('2026-12-31');

    expect(getCurrentOperationalSummaryFilters()).toEqual({
      year: 2026,
      month: 12,
    });
  });
});
