import { getCurrentBusinessDateValue } from '@/shared/domain/date/business-date';
import { FinancialEntryType } from '../../domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { MonthlySummaryRangeInput } from '../dtos/monthly-summary-range.input';
import { MonthlySummaryOutput } from '../dtos/monthly-summary.output';

export class CalculateMonthlySummaryRangeUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: MonthlySummaryRangeInput,
  ): Promise<MonthlySummaryOutput[]> {
    const [currentYear, currentMonth] = getCurrentBusinessDateValue()
      .split('-')
      .map(Number);

    // 0-indexed month of the oldest month in the window (may be negative or
    // overflow — Date.UTC normalizes both correctly, rolling the year).
    const oldestMonthIndex = currentMonth - 1 - (input.months - 1);

    const startDate = new Date(Date.UTC(currentYear, oldestMonthIndex, 1));
    // Exclusive upper bound: the 1st of the month right after the current
    // one, matching findByUserIdAndPeriod's `lt: endDate` convention.
    const endDate = new Date(Date.UTC(currentYear, currentMonth, 1));

    const entries = await this.financialEntryRepository.findByUserIdAndPeriod(
      input.userId,
      startDate,
      endDate,
    );

    const months: MonthlySummaryOutput[] = [];

    for (let i = 0; i < input.months; i++) {
      const monthDate = new Date(
        Date.UTC(currentYear, oldestMonthIndex + i, 1),
      );
      const year = monthDate.getUTCFullYear();
      const month = monthDate.getUTCMonth() + 1;

      const monthEntries = entries.filter(
        (entry) =>
          entry.date.getUTCFullYear() === year &&
          entry.date.getUTCMonth() + 1 === month,
      );

      const totalIncome = monthEntries
        .filter((entry) => entry.type === FinancialEntryType.INCOME)
        .reduce((sum, entry) => sum + entry.amount, 0);

      const totalExpense = monthEntries
        .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
        .reduce((sum, entry) => sum + entry.amount, 0);

      months.push({
        year,
        month,
        totalIncome,
        totalExpense,
        result: totalIncome - totalExpense,
      });
    }

    return months;
  }
}
