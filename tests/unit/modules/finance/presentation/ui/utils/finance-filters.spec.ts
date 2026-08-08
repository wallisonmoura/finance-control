import {
  getCurrentMonthFilters,
  getFinanceHistoryFiltersFromSearchParamsRecord,
  getFinanceHistoryFiltersFromUrlSearchParams,
  isValidCategoryId,
} from '@/modules/finance/presentation/ui/utils/finance-filters';
import { getCurrentBusinessDateValue } from '@/shared/presentation/ui/lib/date';

// A resolução do dia no fuso de negócio (independente do fuso do servidor)
// já é coberta em date.spec.ts. Aqui mockamos o valor para testar só a
// montagem do range do mês a partir dele.
jest.mock('@/shared/presentation/ui/lib/date', () => ({
  getCurrentBusinessDateValue: jest.fn(() => '2026-01-15'),
}));

const mockedGetCurrentBusinessDateValue =
  getCurrentBusinessDateValue as jest.Mock;

describe('getCurrentMonthFilters', () => {
  it('should build the month range from the current business day', () => {
    mockedGetCurrentBusinessDateValue.mockReturnValueOnce('2026-07-31');

    const filters = getCurrentMonthFilters();

    expect(filters.startDate).toBe('2026-07-01');
    expect(filters.endDate).toBe('2026-07-31');
  });

  it('should handle the year change correctly', () => {
    mockedGetCurrentBusinessDateValue.mockReturnValueOnce('2026-12-31');

    const filters = getCurrentMonthFilters();

    expect(filters.startDate).toBe('2026-12-01');
    expect(filters.endDate).toBe('2026-12-31');
  });
});

describe('isValidCategoryId', () => {
  it('should accept a valid UUID', () => {
    expect(isValidCategoryId('11111111-1111-4111-8111-111111111111')).toBe(
      true,
    );
  });

  it('should reject a non-UUID value and null', () => {
    expect(isValidCategoryId('abc')).toBe(false);
    expect(isValidCategoryId(null)).toBe(false);
  });

  it('should reject a UUID with correct hexadecimal format but invalid version', () => {
    // Uma checagem apenas hexadecimal aceitaria este valor, mas a API usa
    // z.uuid() e responderia 400. UI e API precisam concordar.
    expect(isValidCategoryId('11111111-1111-1111-1111-111111111111')).toBe(
      false,
    );
  });
});

describe('parsing categoryId in filters', () => {
  it('should include categoryId from URLSearchParams when valid', () => {
    const params = new URLSearchParams({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      type: 'EXPENSE',
      categoryId: '11111111-1111-4111-8111-111111111111',
    });

    const filters = getFinanceHistoryFiltersFromUrlSearchParams(params);

    expect(filters.categoryId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('should ignore invalid categoryId in the search params record', () => {
    const filters = getFinanceHistoryFiltersFromSearchParamsRecord({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      categoryId: 'not-a-uuid',
    });

    expect(filters.categoryId).toBeUndefined();
  });
});
