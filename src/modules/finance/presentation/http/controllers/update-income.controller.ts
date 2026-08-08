import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryResponseBody,
} from '../presenters/finance-http.presenter';
import {
  updateIncomeSchema,
  UpdateIncomeSchemaData,
} from '../schemas/update-income.schema';
import { financialEntryIdParamSchema } from '../schemas/financial-entry-id-param.schema';
import { UpdateIncomeInput } from '@/modules/finance/application/dtos/update-income.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class UpdateIncomeController implements Controller<
  HttpRequest,
  FinancialEntryResponseBody
> {
  constructor(private readonly updateIncomeUseCase: UpdateIncomeUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<FinancialEntryResponseBody>> {
    const params = financialEntryIdParamSchema.parse(request.params);
    const data: UpdateIncomeSchemaData = updateIncomeSchema.parse(request.body);

    const input: UpdateIncomeInput = {
      id: params.id,
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      date: new Date(`${data.date}T00:00:00.000Z`),
      notes: data.notes,
    };

    const output: FinancialEntryOutput =
      await this.updateIncomeUseCase.execute(input);

    return {
      statusCode: 200,
      body: FinanceHttpPresenter.toResponse(output),
    };
  }
}
