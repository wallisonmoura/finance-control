import { CalculateDailyProfitUseCase } from '@/modules/finance/application/use-cases/calculate-daily-profit.use-case';
import { DailyProfitOutput } from '@/modules/finance/application/dtos/daily-profit.output';
import { CalculateDailyProfitInput } from '@/modules/finance/application/dtos/calculate-daily-profit.input';
import { parseDateFromQuery } from '../schemas/shared/parse-date-from-query';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { calculateDailyProfitQuerySchema } from '../schemas/calculate-daily-profit-query.schema';
import { Controller } from '@/shared/presentation/http/controller';

export class CalculateDailyProfitController implements Controller<
  HttpRequest,
  DailyProfitOutput
> {
  constructor(
    private readonly calculateDailyProfitUseCase: CalculateDailyProfitUseCase,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse<DailyProfitOutput>> {
    const query = calculateDailyProfitQuerySchema.parse(request.query);

    const input: CalculateDailyProfitInput = {
      userId: request.userId!,
      date: parseDateFromQuery(query.date),
    };

    const result = await this.calculateDailyProfitUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
