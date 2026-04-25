import { UpdateWalletBalancesUseCase } from '@/modules/wallet/application/use-cases/update-wallet-balances.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { updateWalletBalancesBodySchema } from '../schemas/update-wallet-balances.schema';
import { UpdateWalletBalancesInput } from '@/modules/wallet/application/dtos/update-wallet-balances.input';

export class UpdateWalletBalancesController implements Controller<
  HttpRequest,
  unknown
> {
  constructor(
    private readonly updateWalletBalancesUseCase: UpdateWalletBalancesUseCase,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = updateWalletBalancesBodySchema.parse(request.body);

    const input: UpdateWalletBalancesInput = {
      userId: request.userId!,
      bankBalance: body.bankBalance,
      cashBalance: body.cashBalance,
      receivableBalance: body.receivableBalance,
    };

    const output = await this.updateWalletBalancesUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
