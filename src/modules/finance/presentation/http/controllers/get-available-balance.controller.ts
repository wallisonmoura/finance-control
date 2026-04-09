import { AvailableBalanceOutput } from '@/modules/finance/application/dtos/available-balance.output';
import { Controller, HttpResponse } from './http.types';
import { GetAvailableBalanceUseCase } from '@/modules/finance/application/use-cases/get-available-balance.use-case';
import { GetAvailableBalanceInput } from '@/modules/finance/application/dtos/get-available-balance.input';

type GetAvailableBalanceControllerRequest = {
  userId: string;
};

export class GetAvailableBalanceController implements Controller<
  GetAvailableBalanceControllerRequest,
  AvailableBalanceOutput
> {
  constructor(
    private readonly getAvailableBalanceUseCase: GetAvailableBalanceUseCase,
  ) {}

  async handle(
    request: GetAvailableBalanceControllerRequest,
  ): Promise<HttpResponse<AvailableBalanceOutput>> {
    const input: GetAvailableBalanceInput = {
      userId: request.userId,
    };

    const result = await this.getAvailableBalanceUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
