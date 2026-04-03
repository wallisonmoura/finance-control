import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { Controller, HttpResponse } from './http.types';
import { DeleteExpenseInput } from '@/modules/finance/application/dtos/delete-expense.input';

interface DeleteExpenseControllerRequest {
  userId: string;
  params: {
    id: string;
  };
}

export class DeleteExpenseController implements Controller<
  DeleteExpenseControllerRequest,
  null
> {
  constructor(private readonly deleteExpenseUseCase: DeleteExpenseUseCase) {}

  async handle({
    userId,
    params,
  }: DeleteExpenseControllerRequest): Promise<HttpResponse<null>> {
    const input: DeleteExpenseInput = {
      id: params.id,
      userId,
    };

    await this.deleteExpenseUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
