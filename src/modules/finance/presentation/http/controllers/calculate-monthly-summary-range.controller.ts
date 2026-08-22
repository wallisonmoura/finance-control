import { MonthlySummaryOutput } from '@/modules/finance/application/dtos/monthly-summary.output';
import { MonthlySummaryRangeInput } from '@/modules/finance/application/dtos/monthly-summary-range.input';
import { CalculateMonthlySummaryRangeUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary-range.use-case';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';
import { monthlySummaryRangeQuerySchema } from '../schemas/monthly-summary-range-query.schema';

export class CalculateMonthlySummaryRangeController implements Controller<
  HttpRequest,
  MonthlySummaryOutput[]
> {
  constructor(
    private readonly calculateMonthlySummaryRangeUseCase: Pick<
      CalculateMonthlySummaryRangeUseCase,
      'execute'
    >,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<MonthlySummaryOutput[]>> {
    const query = monthlySummaryRangeQuerySchema.parse(request.query);

    const input: MonthlySummaryRangeInput = {
      userId: request.userId!,
      months: query.months,
    };

    const result =
      await this.calculateMonthlySummaryRangeUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
