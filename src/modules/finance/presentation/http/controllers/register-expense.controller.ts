import { RegisterExpenseUseCase } from '@/modules/finance/application/use-cases/register-expense.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import {
  registerExpenseSchema,
  RegisterExpenseSchemaData,
} from '../schemas/register-expense.schema';
import { RegisterExpenseInput } from '@/modules/finance/application/dtos/register-expense.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export class RegisterExpenseController implements Controller<
  HttpRequest,
  FinancialEntryHttpResponse
> {
  constructor(
    private readonly registerExpenseUseCase: RegisterExpenseUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<FinancialEntryHttpResponse>> {
    const data: RegisterExpenseSchemaData = registerExpenseSchema.parse(
      request.body,
    );

    const input: RegisterExpenseInput = {
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      date: new Date(`${data.date}T00:00:00.000Z`),
      categoryId: data.categoryId,
      notes: data.notes,
    };

    const output: FinancialEntryOutput =
      await this.registerExpenseUseCase.execute(input);

    return {
      statusCode: 201,
      body: FinanceHttpPresenter.toResponse(output),
    };
  }
}
