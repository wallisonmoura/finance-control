import { UpdateExpenseUseCase } from '@/modules/finance/application/use-cases/update-expense.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryResponseBody,
} from '../presenters/finance-http.presenter';
import {
  updateExpenseSchema,
  UpdateExpenseSchemaData,
} from '../schemas/update-expense.schema';
import { financialEntryIdParamSchema } from '../schemas/financial-entry-id-param.schema';
import { UpdateExpenseInput } from '@/modules/finance/application/dtos/update-expense.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class UpdateExpenseController implements Controller<
  HttpRequest,
  FinancialEntryResponseBody
> {
  constructor(private readonly updateExpenseUseCase: UpdateExpenseUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<FinancialEntryResponseBody>> {
    const params = financialEntryIdParamSchema.parse(request.params);
    const data: UpdateExpenseSchemaData = updateExpenseSchema.parse(
      request.body,
    );

    const input: UpdateExpenseInput = {
      id: params.id,
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      date: new Date(`${data.date}T00:00:00.000Z`),
      categoryId: data.categoryId,
      notes: data.notes,
    };

    const output: FinancialEntryOutput =
      await this.updateExpenseUseCase.execute(input);

    return {
      statusCode: 200,
      body: FinanceHttpPresenter.toResponse(output),
    };
  }
}
