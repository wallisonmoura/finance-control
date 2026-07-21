import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';

export interface GetTransactionHistoryInput {
  userId: string;
  startDate: Date;
  endDate: Date;
  type?: FinancialEntryType;
  categoryId?: string;
}
