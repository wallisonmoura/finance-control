import { GetWalletInput } from '@/modules/wallet/application/dtos/get-wallet.input';
import { WalletOutput } from '@/modules/wallet/application/dtos/wallet.output';
import { GetWalletUseCase } from '@/modules/wallet/application/use-cases/get-wallet.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class GetWalletController implements Controller<
  HttpRequest,
  WalletOutput
> {
  constructor(private readonly getWalletUseCase: GetWalletUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<WalletOutput>> {
    const input: GetWalletInput = {
      userId: request.userId!,
    };

    const output = await this.getWalletUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
