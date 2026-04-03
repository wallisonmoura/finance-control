import { randomUUID } from 'node:crypto';

import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';

type MakeTestFinancialEntryEntityInput = {
  id?: string;
  userId: string;
  type?: FinancialEntryType;
  amount?: number;
  description?: string;
  date?: Date;
  categoryId?: string | null;
  notes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export function makeTestFinancialEntryEntity(
  input: MakeTestFinancialEntryEntityInput,
) {
  return FinancialEntry.create({
    id: input.id ?? randomUUID(),
    userId: input.userId,
    type: input.type ?? FinancialEntryType.INCOME,
    amount: input.amount ?? 100,
    description: input.description ?? 'Lançamento de teste',
    date: input.date ?? new Date('2026-04-01T00:00:00.000Z'),
    categoryId: input.categoryId ?? null,
    notes: input.notes ?? null,
    createdAt: input.createdAt ?? new Date(),
    updatedAt: input.updatedAt ?? new Date(),
  });
}
