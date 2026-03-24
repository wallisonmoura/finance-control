import { FinancialEntryType } from '../../enums/financial-entry-type.enum';

export interface FinancialEntryOutput {
  id: string;
  userId: string;
  type: FinancialEntryType;
  amount: number;
  description: string;
  date: Date;
  categoryId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
