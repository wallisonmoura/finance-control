import { ExpenseCategoryOutput } from '@/modules/finance/application/dtos/expense-category.output';
import { ListExpenseCategoriesUseCase } from '@/modules/finance/application/use-cases/list-expense-categories.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class ListExpenseCategoriesController
  implements Controller<HttpRequest, ExpenseCategoryOutput[]>
{
  constructor(
    private readonly listExpenseCategoriesUseCase: ListExpenseCategoriesUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<ExpenseCategoryOutput[]>> {
    const categories = await this.listExpenseCategoriesUseCase.execute({
      userId: request.userId!,
    });

    return {
      statusCode: 200,
      body: categories,
    };
  }
}
