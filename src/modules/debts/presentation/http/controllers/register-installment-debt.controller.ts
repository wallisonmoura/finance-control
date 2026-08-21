import { RegisterInstallmentDebtUseCase } from '@/modules/debts/application/use-cases/register-installment-debt.use-case';
import { RegisterInstallmentDebtInput } from '@/modules/debts/application/dtos/register-installment-debt.input';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import {
  DebtHttpPresenter,
  DebtResponseBody,
} from '../presenters/debt-http.presenter';
import {
  registerInstallmentDebtSchema,
  RegisterInstallmentDebtSchemaData,
} from '../schemas/register-installment-debt.schema';

export class RegisterInstallmentDebtController implements Controller<
  HttpRequest,
  DebtResponseBody[]
> {
  constructor(
    private readonly registerInstallmentDebtUseCase: Pick<
      RegisterInstallmentDebtUseCase,
      'execute'
    >,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtResponseBody[]>> {
    const data: RegisterInstallmentDebtSchemaData =
      registerInstallmentDebtSchema.parse(request.body);

    const input: RegisterInstallmentDebtInput = {
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      installmentCount: data.installmentCount,
      notes: data.notes,
    };

    const output = await this.registerInstallmentDebtUseCase.execute(input);

    return {
      statusCode: 201,
      body: DebtHttpPresenter.toResponseList(output),
    };
  }
}
