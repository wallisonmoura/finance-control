import { ExpenseCategoryRepository } from '../../domain/repositories/expense-category.repository';
import { ExpenseCategoryOutput } from '../dtos/expense-category.output';

export class ListExpenseCategoriesUseCase {
  constructor(
    private readonly expenseCategoryRepository: ExpenseCategoryRepository,
  ) {}

  async execute(userId: string): Promise<ExpenseCategoryOutput[]> {
    const categories =
      await this.expenseCategoryRepository.findActiveByUserId(userId);

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
    }));
  }
}
