import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { DeleteExpenseInput } from '@/modules/finance/application/dtos/delete-expense.input';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export class DeleteExpenseController implements Controller<HttpRequest, null> {
  constructor(private readonly deleteExpenseUseCase: DeleteExpenseUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<null>> {
    const input: DeleteExpenseInput = {
      id: request.params!.id,
      userId: request.userId!,
    };

    await this.deleteExpenseUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
