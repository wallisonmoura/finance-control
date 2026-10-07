import { prisma } from '@/shared/infra/database/prisma/client';
import { PrismaExpenseCategoryMapper } from '../mappers/prisma-expense-category.mapper';
import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { ExpenseCategory } from '../../domain/entities/expense-category.entity';

export class PrismaExpenseCategoryRepository implements ExpenseCategoryRepository {
  async findById(id: string): Promise<ExpenseCategory | null> {
    const category = await prisma.expenseCategory.findUnique({
      where: { id },
    });

    if (!category) {
      return null;
    }

    return PrismaExpenseCategoryMapper.toDomain(category);
  }

  async findByUserId(userId: string): Promise<ExpenseCategory[]> {
    const categories = await prisma.expenseCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });

    return categories.map(PrismaExpenseCategoryMapper.toDomain);
  }

  async findActiveByUserId(userId: string): Promise<ExpenseCategory[]> {
    const categories = await prisma.expenseCategory.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories.map(PrismaExpenseCategoryMapper.toDomain);
  }

  async update(category: ExpenseCategory): Promise<ExpenseCategory> {
    const updated = await prisma.expenseCategory.update({
      where: { id: category.id },
      data: {
        name: category.name,
        slug: category.slug,
        isActive: category.isActive,
        monthlyLimit: category.monthlyLimit,
      },
    });

    return PrismaExpenseCategoryMapper.toDomain(updated);
  }
}
