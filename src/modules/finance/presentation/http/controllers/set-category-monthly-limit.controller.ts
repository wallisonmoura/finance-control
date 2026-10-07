import { ExpenseCategoryOutput } from '@/modules/finance/application/dtos/expense-category.output';
import { SetCategoryMonthlyLimitUseCase } from '@/modules/finance/application/use-cases/set-category-monthly-limit.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

import { expenseCategoryIdParamSchema } from '../schemas/expense-category-id-param.schema';
import { setCategoryMonthlyLimitSchema } from '../schemas/set-category-monthly-limit.schema';

export class SetCategoryMonthlyLimitController
  implements Controller<HttpRequest, ExpenseCategoryOutput>
{
  constructor(
    private readonly setCategoryMonthlyLimitUseCase: SetCategoryMonthlyLimitUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<ExpenseCategoryOutput>> {
    const params = expenseCategoryIdParamSchema.parse(request.params);
    const data = setCategoryMonthlyLimitSchema.parse(request.body);

    const output = await this.setCategoryMonthlyLimitUseCase.execute({
      userId: request.userId!,
      categoryId: params.id,
      monthlyLimit: data.monthlyLimit,
    });

    return {
      statusCode: 200,
      body: output,
    };
  }
}
