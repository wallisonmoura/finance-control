import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';

export interface FinancialEntryRepository {
  findById(id: string): Promise<FinancialEntry | null>;
  findByUserId(userId: string): Promise<FinancialEntry[]>;
  create(entry: FinancialEntry): Promise<FinancialEntry>;
  update(entry: FinancialEntry): Promise<FinancialEntry>;
  delete(id: string): Promise<void>;
  findByUserIdAndDate(userId: string, date: Date): Promise<FinancialEntry[]>;
  findByUserIdAndPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<FinancialEntry[]>;
  getPeriodTotals(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<PeriodTotals>;
  findByUserIdAndPeriodPaginated(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: FinancialEntryType | undefined,
    categoryId: string | undefined,
    pagination: { skip: number; take: number },
  ): Promise<FinancialEntry[]>;
}

export interface PeriodTotals {
  totalIncome: number;
  totalExpense: number;
  count: number;
}
