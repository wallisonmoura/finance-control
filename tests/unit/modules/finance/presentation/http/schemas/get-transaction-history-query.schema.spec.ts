import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { getTransactionHistoryQuerySchema } from '@/modules/finance/presentation/http/schemas/get-transaction-history-query.schema';

describe('getTransactionHistoryQuerySchema', () => {
  it('deve aceitar query válida sem type', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
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

  it('deve aceitar query válida com type INCOME', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: FinancialEntryType.INCOME,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(FinancialEntryType.INCOME);
    }
  });

  it('deve aceitar query válida com type EXPENSE', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: FinancialEntryType.EXPENSE,
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.type).toBe(FinancialEntryType.EXPENSE);
    }
  });

  it('deve rejeitar startDate ausente', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar endDate ausente', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar startDate inválida', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '01/03/2026',
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar endDate inválida', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '31/03/2026',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar type inválido', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-03-01',
      endDate: '2026-03-31',
      type: 'INVALID',
    });

    expect(result.success).toBe(false);
  });

  it('deve rejeitar quando startDate for maior que endDate', () => {
    const result = getTransactionHistoryQuerySchema.safeParse({
      startDate: '2026-04-01',
      endDate: '2026-03-31',
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'startDate must be less than or equal to endDate',
      );
      expect(result.error.issues[0].path).toEqual(['startDate']);
    }
  });
});
