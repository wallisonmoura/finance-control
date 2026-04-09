import { MonthlySummaryOutput } from '@/modules/finance/application/dtos/monthly-summary.output';
import { calculateMonthlySummaryQuerySchema } from '../schemas/calculate-monthly-summary-query.schema';
import { Controller, HttpResponse } from './http.types';
import { CalculateMonthlySummaryUseCase } from '@/modules/finance/application/use-cases/calculate-monthly-summary.use-case';
import { CalculateMonthlySummaryInput } from '@/modules/finance/application/dtos/calculate-monthly-summary.input';

type CalculateMonthlySummaryControllerRequest = {
  userId: string;
  query: {
    year?: string;
    month?: string;
  };
};

export class CalculateMonthlySummaryController implements Controller<
  CalculateMonthlySummaryControllerRequest,
  MonthlySummaryOutput
> {
  constructor(
    private readonly calculateMonthlySummaryUseCase: CalculateMonthlySummaryUseCase,
  ) {}

  async handle(
    request: CalculateMonthlySummaryControllerRequest,
  ): Promise<HttpResponse<MonthlySummaryOutput>> {
    const query = calculateMonthlySummaryQuerySchema.parse(request.query);

    const input: CalculateMonthlySummaryInput = {
      userId: request.userId,
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
