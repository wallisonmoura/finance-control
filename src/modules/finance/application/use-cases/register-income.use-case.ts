import { isAfterBusinessToday } from '@/shared/domain/date/business-date';
import { FutureDateNotAllowedError } from '@/shared/domain/errors/future-date-not-allowed.error';
import { randomUUID } from 'node:crypto';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { RegisterIncomeInput } from '../dtos/register-income.input';
import { FinancialEntry } from '../../domain/entities/financial-entry.entity';

export class RegisterIncomeUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: RegisterIncomeInput): Promise<FinancialEntryOutput> {
    if (isAfterBusinessToday(input.date)) {
      throw new FutureDateNotAllowedError();
    }

    const now = new Date();

    const entry = FinancialEntry.create({
      id: randomUUID(),
      userId: input.userId,
      type: FinancialEntryType.INCOME,
      amount: input.amount,
      description: input.description,
      date: input.date,
      categoryId: null,
      notes: input.notes ?? null,
      createdAt: now,
      updatedAt: now,
    });

    const createdEntry = await this.financialEntryRepository.create(entry);

    return createdEntry.toJSON();
  }
}
