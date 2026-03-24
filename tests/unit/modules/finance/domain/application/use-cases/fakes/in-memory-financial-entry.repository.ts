import { FinancialEntry } from '@/modules/finance/domain/entities/financial-entry.entity';
import { FinancialEntryRepository } from '@/modules/finance/domain/repositories/financial-entry.repository';

export class InMemoryFinancialEntryRepository implements FinancialEntryRepository {
  constructor(private readonly entries: FinancialEntry[] = []) {}

  async findById(id: string): Promise<FinancialEntry | null> {
    return this.entries.find((entry) => entry.id === id) ?? null;
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
  ): Promise<FinancialEntry[]> {
    return this.entries.filter((entry) => {
      return (
        entry.userId === userId &&
        entry.date >= startDate &&
        entry.date <= endDate
      );
    });
  }
}
