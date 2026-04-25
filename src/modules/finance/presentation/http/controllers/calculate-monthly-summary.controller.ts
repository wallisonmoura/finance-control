import { MonthlySummaryOutput } from '@/modules/finance/application/dtos/monthly-summary.output';
import { calculateMonthlySummaryQuerySchema } from '../schemas/calculate-monthly-summary-query.schema';
import { CalculateMonthlySummaryUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary.use-case';
import { CalculateMonthlySummaryInput } from '@/modules/finance/application/dtos/calculate-monthly-summary.input';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export class CalculateMonthlySummaryController implements Controller<
  HttpRequest,
  MonthlySummaryOutput
> {
  constructor(
    private readonly calculateMonthlySummaryUseCase: CalculateMonthlySummaryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<MonthlySummaryOutput>> {
    const query = calculateMonthlySummaryQuerySchema.parse(request.query);

    const input: CalculateMonthlySummaryInput = {
      userId: request.userId!,
      year: Number(query.year),
      month: Number(query.month),
    };

    const result = await this.calculateMonthlySummaryUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
