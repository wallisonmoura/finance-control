import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import {
  updateIncomeSchema,
  UpdateIncomeSchemaData,
} from '../schemas/update-income.schema';
import { UpdateIncomeInput } from '@/modules/finance/application/dtos/update-income.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class UpdateIncomeController implements Controller<
  HttpRequest,
  FinancialEntryHttpResponse
> {
  constructor(private readonly updateIncomeUseCase: UpdateIncomeUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<FinancialEntryHttpResponse>> {
    const data: UpdateIncomeSchemaData = updateIncomeSchema.parse(request.body);

    const input: UpdateIncomeInput = {
      id: request.params!.id,
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
