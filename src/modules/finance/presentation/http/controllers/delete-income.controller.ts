import { DeleteIncomeUseCase } from '@/modules/finance/application/use-cases/delete-income.use-case';
import { Controller, HttpResponse } from './http.types';
import { DeleteIncomeInput } from '@/modules/finance/application/dtos/delete-income.input';

interface DeleteIncomeControllerRequest {
  userId: string;
  params: {
    id: string;
  };
}

export class DeleteIncomeController implements Controller<
  DeleteIncomeControllerRequest,
  null
> {
  constructor(private readonly deleteIncomeUseCase: DeleteIncomeUseCase) {}

  async handle({
    userId,
    params,
  }: DeleteIncomeControllerRequest): Promise<HttpResponse<null>> {
    const input: DeleteIncomeInput = {
      id: params.id,
      userId,
    };

    await this.deleteIncomeUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
