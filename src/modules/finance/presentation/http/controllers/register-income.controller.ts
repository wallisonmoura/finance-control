import { RegisterIncomeUseCase } from '@/modules/finance/application/use-cases/register-income.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import {
  registerIncomeSchema,
  RegisterIncomeSchemaData,
} from '../schemas/register-income.schema';
import { RegisterIncomeInput } from '@/modules/finance/application/dtos/register-income.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export class RegisterIncomeController implements Controller<
  HttpRequest,
  FinancialEntryHttpResponse
> {
  constructor(private readonly registerIncomeUseCase: RegisterIncomeUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<FinancialEntryHttpResponse>> {
    const data: RegisterIncomeSchemaData = registerIncomeSchema.parse(
      request.body,
    );

    const input: RegisterIncomeInput = {
      userId: request.userId!,
      amount: data.amount,
      description: data.description,
      date: new Date(`${data.date}T00:00:00.000Z`),
      notes: data.notes,
    };

    const output: FinancialEntryOutput =
      await this.registerIncomeUseCase.execute(input);

    return {
      statusCode: 201,
      body: FinanceHttpPresenter.toResponse(output),
    };
  }
}
