import { ExpenseCategory as PrismaExpenseCategory } from '@prisma/client';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

export class PrismaExpenseCategoryMapper {
  static toDomain(category: PrismaExpenseCategory): ExpenseCategory {
    return ExpenseCategory.create({
      id: category.id,
      userId: category.userId,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    });
  }
}
