import { UpdateDebtUseCase } from '@/modules/debts/application/use-cases/update-debt.use-case';
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
import {
  updateDebtSchema,
  UpdateDebtSchemaData,
} from '../schemas/update-debt.schema';
import { UpdateDebtInput } from '@/modules/debts/application/dtos/update-debt.input';

export class UpdateDebtController implements Controller<
  HttpRequest,
  DebtResponseBody
> {
  constructor(private readonly updateDebtUseCase: UpdateDebtUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtResponseBody>> {
    const params = debtIdParamSchema.parse(request.params);
    const data: UpdateDebtSchemaData = updateDebtSchema.parse(request.body);

    const input: UpdateDebtInput = {
      id: params.id,
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      type: data.type,
      notes: data.notes,
    };

    const output = await this.updateDebtUseCase.execute(input);

    return {
      statusCode: 200,
      body: DebtHttpPresenter.toResponse(output),
    };
  }
}
