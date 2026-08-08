import { BalanceSummaryOutput } from '@/modules/balance/application/dtos/balance-summary.output';
import { GetBalanceSummaryUseCase } from '@/modules/balance/application/use-cases/get-balance-summary.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class GetBalanceSummaryController implements Controller<
  HttpRequest,
  BalanceSummaryOutput
> {
  constructor(
    private readonly getBalanceSummaryUseCase: GetBalanceSummaryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<BalanceSummaryOutput>> {
    const output = await this.getBalanceSummaryUseCase.execute({
      userId: request.userId!,
    });

    return {
      statusCode: 200,
      body: output,
    };
  }
}
