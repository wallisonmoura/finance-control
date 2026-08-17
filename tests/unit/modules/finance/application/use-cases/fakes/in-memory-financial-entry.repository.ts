import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import {
  FinancialEntryRepository,
  PeriodTotals,
} from '@/modules/finance/domain/repositories/financial-entry.repository';

export class InMemoryFinancialEntryRepository implements FinancialEntryRepository {
  constructor(private readonly entries: FinancialEntry[] = []) {}

  async findById(id: string): Promise<FinancialEntry | null> {
    return this.entries.find((entry) => entry.id === id) ?? null;
  }

  async findByUserId(userId: string): Promise<FinancialEntry[]> {
    return this.entries.filter((entry) => entry.userId === userId);
  }

  async create(entry: FinancialEntry): Promise<FinancialEntry> {
    this.entries.push(entry);
    return entry;
  }

  async update(entry: FinancialEntry): Promise<FinancialEntry> {
    const index = this.entries.findIndex((item) => item.id === entry.id);

    if (index !== -1) {
      this.entries[index] = entry;
    }
    return entry;
  }

  async delete(id: string): Promise<void> {
    const index = this.entries.findIndex((entry) => entry.id === id);

    if (index !== -1) {
      this.entries.splice(index, 1);
    }
  }

  async findByUserIdAndDate(
    userId: string,
    date: Date,
  ): Promise<FinancialEntry[]> {
    return this.entries.filter((entry) => {
      const sameUser = entry.userId === userId;

      const sameUtcDay =
        entry.date.getUTCFullYear() === date.getUTCFullYear() &&
        entry.date.getUTCMonth() === date.getUTCMonth() &&
        entry.date.getUTCDate() === date.getUTCDate();

      return sameUser && sameUtcDay;
    });
  }

  async findByUserIdAndPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<FinancialEntry[]> {
    return this.filterByPeriod(userId, startDate, endDate, type, categoryId);
  }

  async getPeriodTotals(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): Promise<PeriodTotals> {
    const matches = this.filterByPeriod(
      userId,
      startDate,
      endDate,
      type,
      categoryId,
    );

    const totalIncome = matches
      .filter((entry) => entry.type === FinancialEntryType.INCOME)
      .reduce((sum, entry) => sum + entry.amount, 0);

    const totalExpense = matches
      .filter((entry) => entry.type === FinancialEntryType.EXPENSE)
      .reduce((sum, entry) => sum + entry.amount, 0);

    return { totalIncome, totalExpense, count: matches.length };
  }

  async findByUserIdAndPeriodPaginated(
    userId: string,
    startDate: Date,
    endDate: Date,
    type: FinancialEntryType | undefined,
    categoryId: string | undefined,
    pagination: { skip: number; take: number },
  ): Promise<FinancialEntry[]> {
    const matches = this.filterByPeriod(
      userId,
      startDate,
      endDate,
      type,
      categoryId,
    ).sort((a, b) => b.date.getTime() - a.date.getTime());

    return matches.slice(
      pagination.skip,
      pagination.skip + pagination.take,
    );
  }

  private filterByPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
    categoryId?: string,
  ): FinancialEntry[] {
    return this.entries.filter((entry) => {
      const isSameUser = entry.userId === userId;
      // Fim exclusivo, espelhando o `lt: endDate` do PrismaFinancialEntryRepository.
      // Divergir daqui faz o teste unitário discordar do banco.
      const isWithinPeriod = entry.date >= startDate && entry.date < endDate;
      const matchesType = type ? entry.type === type : true;
      const matchesCategory = categoryId
        ? entry.categoryId === categoryId
        : true;

      return isSameUser && isWithinPeriod && matchesType && matchesCategory;
    });
  }
}
