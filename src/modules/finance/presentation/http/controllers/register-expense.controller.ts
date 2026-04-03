import { RegisterExpenseUseCase } from '@/modules/finance/application/use-cases/register-expense.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import { Controller, HttpResponse } from './http.types';
import {
  registerExpenseSchema,
  RegisterExpenseSchemaData,
} from '../schemas/register-expense.schema';
import { RegisterExpenseInput } from '@/modules/finance/application/dtos/register-expense.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';

interface RegisterExpenseControllerRequest {
  userId: string;
  body: unknown;
}

export class RegisterExpenseController implements Controller<
  RegisterExpenseControllerRequest,
  FinancialEntryHttpResponse
> {
  constructor(
    private readonly registerExpenseUseCase: RegisterExpenseUseCase,
  ) {}

  async handle({
    userId,
    body,
  }: RegisterExpenseControllerRequest): Promise<
    HttpResponse<FinancialEntryHttpResponse>
  > {
    const data: RegisterExpenseSchemaData = registerExpenseSchema.parse(body);

    const input: RegisterExpenseInput = {
      userId,
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
