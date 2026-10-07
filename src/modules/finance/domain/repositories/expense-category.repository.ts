import { ExpenseCategory } from '../entities/expense-category.entity';

export interface ExpenseCategoryRepository {
  findById(id: string): Promise<ExpenseCategory | null>;
  findByUserId(userId: string): Promise<ExpenseCategory[]>;
  findActiveByUserId(userId: string): Promise<ExpenseCategory[]>;
  update(category: ExpenseCategory): Promise<ExpenseCategory>;
}
