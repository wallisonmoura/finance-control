import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';

export interface FinancialEntryResponseBody {
  id: string;
  userId: string;
  type: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string | null;
  debtId: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export class FinanceHttpPresenter {
  static toResponse(entry: FinancialEntryOutput): FinancialEntryResponseBody {
    return {
      id: entry.id,
      userId: entry.userId,
      type: entry.type,
      amount: entry.amount,
      description: entry.description,
      date: entry.date.toISOString().slice(0, 10),
      categoryId: entry.categoryId ?? null,
      debtId: entry.debtId ?? null,
      notes: entry.notes ?? null,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    };
  }

  static toResponseList(
    entries: FinancialEntryOutput[],
  ): FinancialEntryResponseBody[] {
    return entries.map((entry) => FinanceHttpPresenter.toResponse(entry));
  }
}
