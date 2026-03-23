import { ExpenseCategory } from '../entities/expense-category.entity';

export interface ExpenseCategoryRepository {
  findById(id: string): Promise<ExpenseCategory | null>;
  findByUserId(userId: string): Promise<ExpenseCategory[]>;
}
