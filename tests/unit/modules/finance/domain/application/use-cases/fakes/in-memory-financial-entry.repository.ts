import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { FinancialEntryRepository } from '@/modules/finance/domain/repositories/financial-entry.repository';

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
      return (
        entry.userId === userId &&
        entry.date.toDateString() === date.toDateString()
      );
    });
  }

  async findByUserIdAndPeriod(
    userId: string,
    startDate: Date,
    endDate: Date,
    type?: FinancialEntryType,
  ): Promise<FinancialEntry[]> {
    return this.entries.filter((entry) => {
      const isSameUser = entry.userId === userId;
      const isWithinPeriod = entry.date >= startDate && entry.date <= endDate;
      const matchesType = type ? entry.type === type : true;

      return isSameUser && isWithinPeriod && matchesType;
    });
  }
}
