import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtRepository } from '@/modules/debts/domain/repositories/debt.repository';

export class InMemoryDebtRepository implements DebtRepository {
  constructor(public items: Debt[] = []) {}

  async findById(id: string): Promise<Debt | null> {
    return this.items.find((debt) => debt.id === id) ?? null;
  }

  async findByUserId(userId: string): Promise<Debt[]> {
    return this.items.filter((debt) => debt.userId === userId);
  }

  async findPendingByUserId(userId: string): Promise<Debt[]> {
    return this.items.filter(
      (debt) => debt.userId === userId && debt.isPending(),
    );
  }

  async create(debt: Debt): Promise<Debt> {
    this.items.push(debt);
    return debt;
  }

  async update(debt: Debt): Promise<Debt> {
    const index = this.items.findIndex((item) => item.id === debt.id);

    if (index !== -1) {
      this.items[index] = debt;
    }

    return debt;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((debt) => debt.id !== id);
  }
}
