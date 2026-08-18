import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getFullTransactionHistoryQuerySchema } from '@/modules/finance/presentation/http/schemas/get-full-transaction-history-query.schema';

describe('getFullTransactionHistoryQuerySchema', () => {
  it('should accept a valid query without type', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual({
        startDate: '2026-03-01',
        endDate: '2026-03-31',
      });
    }
  });

  it('should accept a valid query with type INCOME', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: FinancialEntryType.INCOME,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(FinancialEntryType.INCOME);
    }
  });

  it('should accept a valid query with type EXPENSE', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: FinancialEntryType.EXPENSE,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(FinancialEntryType.EXPENSE);
    }
  });

  it('should reject missing startDate', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);
  });

  it('should reject missing endDate', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid startDate', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '01/03/2026',
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid endDate', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '31/03/2026',
    });

    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: 'INVALID',
    });

    expect(result.success).toBe(false);
  });

  it('should reject when startDate is greater than endDate', () => {
    const result = getFullTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-04-01',
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Data inicial deve ser menor ou igual à data final.',
      );
      expect(result.error.issues[0].path).toEqual(['startDate']);
    }
  });

  it('should accept categoryId when it is a valid UUID', () => {
    const result = getFullTransactionHistoryQuerySchema.parse({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      type: 'EXPENSE',
      categoryId: '11111111-1111-4111-8111-111111111111',
    });

    expect(result.categoryId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('should reject categoryId that is not a UUID', () => {
    expect(() =>
      getFullTransactionHistoryQuerySchema.parse({
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        categoryId: 'not-a-uuid',
      }),
    ).toThrow();
  });

  it('should not accept page and pageSize fields', () => {
    const result = getFullTransactionHistoryQuerySchema.parse({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      page: '2',
      pageSize: '50',
    });

    expect(result).not.toHaveProperty('page');
    expect(result).not.toHaveProperty('pageSize');
  });
});
