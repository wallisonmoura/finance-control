import { DeleteDebtUseCase } from '@/modules/debts/application/use-cases/delete-debt.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { debtIdParamSchema } from '../schemas/debt-id-param.schema';
import { DeleteDebtInput } from '@/modules/debts/application/dto/delete-debt.input';

export class DeleteDebtController implements Controller<HttpRequest, null> {
  constructor(private readonly deleteDebtUseCase: DeleteDebtUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<null>> {
    const params = debtIdParamSchema.parse(request.params);

    const input: DeleteDebtInput = {
      id: params.id,
      userId: request.userId!,
    };

    await this.deleteDebtUseCase.execute(input);

    return {
      statusCode: 204,
      body: null,
    };
  }
}
