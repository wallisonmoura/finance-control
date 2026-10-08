import { ExpenseCategoryNotFoundError } from '../../domain/errors/expense-category-not-found.error';
import { InactiveExpenseCategoryError } from '../../domain/errors/inactive-expense-category.error';
import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { ExpenseCategoryOutput } from '../dtos/expense-category.output';
import { SetCategoryMonthlyLimitInput } from '../dtos/set-category-monthly-limit.input';

export class SetCategoryMonthlyLimitUseCase {
  constructor(
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(
    input: SetCategoryMonthlyLimitInput,
  ): Promise<ExpenseCategoryOutput> {
    const category = await this.expenseCategoryRepository.findById(
      input.categoryId,
    );

    // Another user's category is reported as not found, so its existence
    // is never revealed.
    if (!category || category.userId !== input.userId) {
      throw new ExpenseCategoryNotFoundError();
    }

    if (!category.isActive) {
      throw new InactiveExpenseCategoryError();
    }

    const updated = await this.expenseCategoryRepository.update(
      category.withMonthlyLimit(input.monthlyLimit),
    );

    return {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      monthlyLimit: updated.monthlyLimit,
    };
  }
}
