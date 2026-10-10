import { IncomeGoalTargetsOutput } from '@/modules/finance/application/dtos/income-goals.output';
import { SetIncomeGoalsUseCase } from '@/modules/finance/application/use-cases/set-income-goals.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

import { setIncomeGoalsSchema } from '../schemas/set-income-goals.schema';

export class SetIncomeGoalsController
  implements Controller<HttpRequest, IncomeGoalTargetsOutput>
{
  constructor(private readonly setIncomeGoalsUseCase: SetIncomeGoalsUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<IncomeGoalTargetsOutput>> {
    const data = setIncomeGoalsSchema.parse(request.body);

    const output = await this.setIncomeGoalsUseCase.execute({
      userId: request.userId!,
      revenueTarget: data.revenueTarget,
      profitTarget: data.profitTarget,
    });

    return {
      statusCode: 200,
      body: output,
    };
  }
}
