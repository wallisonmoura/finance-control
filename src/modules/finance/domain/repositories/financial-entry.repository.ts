import { FinancialEntry } from '../entities/financial-entry.entity';

export interface FinancialEntryRepository {
  findById(id: string): Promise<FinancialEntry | null>;
  create(entry: FinancialEntry): Promise<FinancialEntry>;
  update(entry: FinancialEntry): Promise<FinancialEntry>;
  delete(id: string): Promise<void>;
  findByUserIdAndDate(userId: string, date: Date): Promise<FinancialEntry[]>;
  findByUserIdAndPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<FinancialEntry[]>;
}
