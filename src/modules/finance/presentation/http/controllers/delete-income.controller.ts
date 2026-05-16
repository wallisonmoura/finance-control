import { DeleteIncomeUseCase } from '@/modules/finance/application/use-cases/delete-income.use-case';
import { DeleteIncomeInput } from '@/modules/finance/application/dtos/delete-income.input';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';
import { financialEntryIdParamSchema } from '../schemas/financial-entry-id-param.schema';

export class DeleteIncomeController implements Controller<HttpRequest, null> {
  constructor(private readonly deleteIncomeUseCase: DeleteIncomeUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<null>> {
    const params = financialEntryIdParamSchema.parse(request.params);

    const input: DeleteIncomeInput = {
      id: params.id,
      userId: request.userId!,
    };

    await this.deleteIncomeUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
