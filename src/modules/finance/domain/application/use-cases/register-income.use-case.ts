import { randomUUID } from 'node:crypto';
import { FinancialEntry } from '../../entities/financial-entry.entity';
import { FinancialEntryRepository } from '../../repositories/financial-entry.repository';
import { FinancialEntryOutput } from '../dtos/financial-entry.output';
import { RegisterIncomeInput } from '../dtos/register-income.input';
import { FinancialEntryType } from '../../enums/financial-entry-type.enum';

export class RegisterIncomeUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(input: RegisterIncomeInput): Promise<FinancialEntryOutput> {
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
