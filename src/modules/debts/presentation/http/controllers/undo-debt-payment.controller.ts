import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { UndoDebtPaymentInput } from '@/modules/debts/application/dtos/undo-debt-payment.input';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { debtIdParamSchema } from '../schemas/debt-id-param.schema';
import {
  DebtHttpPresenter,
  DebtResponseBody,
} from '../presenters/debt-http.presenter';

// Same reason as PayDebtUseCaseContract: makeUndoDebtPaymentUseCase() builds
// the use case per transaction and only exposes `execute`.
export type UndoDebtPaymentUseCaseContract = {
  execute(input: UndoDebtPaymentInput): Promise<DebtOutput>;
};

export class UndoDebtPaymentController implements Controller<
  HttpRequest,
  DebtResponseBody
> {
  constructor(
    private readonly undoDebtPaymentUseCase: UndoDebtPaymentUseCaseContract,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtResponseBody>> {
    const params = debtIdParamSchema.parse(request.params);

    const output = await this.undoDebtPaymentUseCase.execute({
      id: params.id,
      userId: request.userId!,
    });

    return {
      statusCode: 200,
      body: DebtHttpPresenter.toResponse(output),
    };
  }
}
