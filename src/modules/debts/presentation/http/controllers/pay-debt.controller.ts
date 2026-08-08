import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { debtIdParamSchema } from '../schemas/debt-id-param.schema';
import {
  DebtHttpPresenter,
  DebtHttpResponse,
} from '../presenters/debt-http.presenter';
import { payDebtSchema, PayDebtSchemaData } from '../schemas/pay-debt.schema';
import { PayDebtInput } from '@/modules/debts/application/dtos/pay-debt.input';

// PayDebtUseCase is composed transactionally by makePayDebtUseCase() (see
// make-pay-debt-use-case.ts), which returns Pick<PayDebtUseCase, 'execute'>
// rather than a concrete instance because its dependencies are constructed
// per-transaction. The controller depends on that narrower contract on
// purpose — it cannot depend on the concrete class here.
export type PayDebtUseCaseContract = {
  execute(input: PayDebtInput): Promise<DebtOutput>;
};

export class PayDebtController implements Controller<
  HttpRequest,
  DebtHttpResponse
> {
  constructor(private readonly payDebtUseCase: PayDebtUseCaseContract) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtHttpResponse>> {
    const params = debtIdParamSchema.parse(request.params);
    const data: PayDebtSchemaData = payDebtSchema.parse(request.body);

    const input: PayDebtInput = {
      id: params.id,
      userId: request.userId!,
      paidAt: new Date(`${data.paidAt}T00:00:00.000Z`),
      expenseCategoryId: data.expenseCategoryId,
      paymentSource: data.paymentSource,
    };

    const output: DebtOutput = await this.payDebtUseCase.execute(input);

    return {
      statusCode: 200,
      body: DebtHttpPresenter.toResponse(output),
    };
  }
}
