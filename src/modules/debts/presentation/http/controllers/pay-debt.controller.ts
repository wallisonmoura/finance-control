import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { debtIdParamSchema } from '../schemas/debt-id-param.schema';
import { payDebtSchema, PayDebtSchemaData } from '../schemas/pay-debt.schema';
import { PayDebtInput } from '@/modules/debts/application/dtos/pay-debt.input';

type PayDebtUseCaseContract = {
  execute(input: PayDebtInput): Promise<DebtOutput>;
};

export class PayDebtController implements Controller<HttpRequest, DebtOutput> {
  constructor(private readonly payDebtUseCase: PayDebtUseCaseContract) {}

  async handle(request: HttpRequest): Promise<HttpResponse<DebtOutput>> {
    const params = debtIdParamSchema.parse(request.params);
    const data: PayDebtSchemaData = payDebtSchema.parse(request.body);

    const input: PayDebtInput = {
      id: params.id,
      userId: request.userId!,
      paidAt: new Date(`${data.paidAt}T00:00:00.000Z`),
      expenseCategoryId: data.expenseCategoryId,
      paymentSource: data.paymentSource,
    };

    const output = await this.payDebtUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
