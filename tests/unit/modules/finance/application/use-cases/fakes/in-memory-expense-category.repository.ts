import { ExpenseCategory } from '@/modules/finance/domain/entities/expense-category.entity';
import { ExpenseCategoryRepository } from '@/modules/finance/domain/repositories/expense-category.repository';

export class InMemoryExpenseCategoryRepository implements ExpenseCategoryRepository {
  constructor(private readonly categories: ExpenseCategory[] = []) {}

  async findById(id: string): Promise<ExpenseCategory | null> {
    return this.categories.find((category) => category.id === id) ?? null;
  }

  async findByUserId(userId: string): Promise<ExpenseCategory[]> {
    return this.categories.filter((category) => category.userId === userId);
  }

  async findActiveByUserId(userId: string): Promise<ExpenseCategory[]> {
    return this.categories.filter(
      (category) => category.userId === userId && category.isActive,
    );
  }

  async update(category: ExpenseCategory): Promise<ExpenseCategory> {
    const index = this.categories.findIndex((item) => item.id === category.id);
    this.categories[index] = category;

    return category;
  }
}
