import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { ExpenseCategoryOutput } from '../dtos/expense-category.output';
import { ListExpenseCategoriesInput } from '../dtos/list-expense-categories.input';

export class ListExpenseCategoriesUseCase {
  constructor(
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(
    input: ListExpenseCategoriesInput,
  ): Promise<ExpenseCategoryOutput[]> {
    const categories = await this.expenseCategoryRepository.findActiveByUserId(
      input.userId,
    );

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      monthlyLimit: category.monthlyLimit,
    }));
  }
}
