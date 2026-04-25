import { GetWalletSummaryOutput } from '@/modules/wallet/application/dtos/get-wallet-summary.output';
import { GetWalletInput } from '@/modules/wallet/application/dtos/get-wallet.input';
import { GetWalletSummaryUseCase } from '@/modules/wallet/application/use-cases/get-wallet-summary.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class GetWalletSummaryController implements Controller<
  HttpRequest,
  GetWalletSummaryOutput
> {
  constructor(
    private readonly getWalletSummaryUseCase: GetWalletSummaryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<GetWalletSummaryOutput>> {
    const input: GetWalletInput = {
      userId: request.userId!,
    };

    const output = await this.getWalletSummaryUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
