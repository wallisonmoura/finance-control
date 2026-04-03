import { UpdateExpenseUseCase } from '@/modules/finance/application/use-cases/update-expense.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import { Controller, HttpResponse } from './http.types';
import {
  updateExpenseSchema,
  UpdateExpenseSchemaData,
} from '../schemas/update-expense.schema';
import { UpdateExpenseInput } from '@/modules/finance/application/dtos/update-expense.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';

interface UpdateExpenseControllerRequest {
  userId: string;
  params: {
    id: string;
  };
  body: unknown;
}

export class UpdateExpenseController implements Controller<
  UpdateExpenseControllerRequest,
  FinancialEntryHttpResponse
> {
  constructor(private readonly updateExpenseUseCase: UpdateExpenseUseCase) {}

  async handle({
    userId,
    params,
    body,
  }: UpdateExpenseControllerRequest): Promise<
    HttpResponse<FinancialEntryHttpResponse>
  > {
    const data: UpdateExpenseSchemaData = updateExpenseSchema.parse(body);

    const input: UpdateExpenseInput = {
      id: params.id,
      userId,
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
