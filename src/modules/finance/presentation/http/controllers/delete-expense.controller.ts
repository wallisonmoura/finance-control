import { DeleteExpenseUseCase } from '@/modules/finance/application/use-cases/delete-expense.use-case';
import { DeleteExpenseInput } from '@/modules/finance/application/dtos/delete-expense.input';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';
import { financialEntryIdParamSchema } from '../schemas/financial-entry-id-param.schema';

export class DeleteExpenseController implements Controller<HttpRequest, null> {
  constructor(private readonly deleteExpenseUseCase: DeleteExpenseUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<null>> {
    const params = financialEntryIdParamSchema.parse(request.params);

    const input: DeleteExpenseInput = {
      id: params.id,
      userId: request.userId!,
    };

    await this.deleteExpenseUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
