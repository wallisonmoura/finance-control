import { BalanceSummaryOutput } from '@/modules/balance/application/dtos/balance-summary.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export type GetBalanceSummaryUseCaseContract = {
  execute(input: { userId: string }): Promise<BalanceSummaryOutput>;
};

export class GetBalanceSummaryController implements Controller<
  HttpRequest,
  BalanceSummaryOutput
> {
  constructor(
    private readonly getBalanceSummaryUseCase: GetBalanceSummaryUseCaseContract,
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
