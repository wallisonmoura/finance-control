import { Debt } from '@/modules/debts/domain/entities/debt.entity';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
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

  async findGeneratedFrom(debtId: string, userId: string): Promise<Debt | null> {
    return (
      this.items.find(
        (debt) => debt.generatedFromDebtId === debtId && debt.userId === userId,
      ) ?? null
    );
  }

  async markPaymentUndone(debt: Debt): Promise<boolean> {
    const index = this.items.findIndex(
      (item) =>
        item.id === debt.id &&
        item.userId === debt.userId &&
        item.status === DebtStatus.PAID,
    );

    if (index === -1) {
      return false;
    }

    this.items[index] = debt;
    return true;
  }

  async deletePendingGeneratedFrom(debtId: string, userId: string): Promise<number> {
    const before = this.items.length;

    this.items = this.items.filter(
      (debt) =>
        !(
          debt.generatedFromDebtId === debtId &&
          debt.userId === userId &&
          debt.isPending()
        ),
    );

    return before - this.items.length;
  }
}
