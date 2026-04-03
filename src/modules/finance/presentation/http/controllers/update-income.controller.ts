import { UpdateIncomeUseCase } from '@/modules/finance/application/use-cases/update-income.use-case';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import { Controller, HttpResponse } from './http.types';
import {
  updateIncomeSchema,
  UpdateIncomeSchemaData,
} from '../schemas/update-income.schema';
import { UpdateIncomeInput } from '@/modules/finance/application/dtos/update-income.input';
import { FinancialEntryOutput } from '@/modules/finance/application/dtos/financial-entry.output';

interface UpdateIncomeControllerRequest {
  userId: string;
  params: {
    id: string;
  };
  body: unknown;
}

export class UpdateIncomeController implements Controller<
  UpdateIncomeControllerRequest,
  FinancialEntryHttpResponse
> {
  constructor(private readonly updateIncomeUseCase: UpdateIncomeUseCase) {}

  async handle({
    userId,
    params,
    body,
  }: UpdateIncomeControllerRequest): Promise<
    HttpResponse<FinancialEntryHttpResponse>
  > {
    const data: UpdateIncomeSchemaData = updateIncomeSchema.parse(body);

    const input: UpdateIncomeInput = {
      id: params.id,
      userId,
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
