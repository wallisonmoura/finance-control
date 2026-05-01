import { DebtOutput } from '@/modules/debts/application/dto/debt.output';
import { ListPendingDebtsInput } from '@/modules/debts/application/dto/list-pending-debts.input';
import { ListPendingDebtsUseCase } from '@/modules/debts/application/use-cases/list-pending-debts.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class ListPendingDebtsController implements Controller<
  HttpRequest,
  DebtOutput[]
> {
  constructor(
    private readonly listPendingDebtsUseCase: ListPendingDebtsUseCase,
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse<DebtOutput[]>> {
    const input: ListPendingDebtsInput = {
      userId: request.userId!,
    };

    const output = await this.listPendingDebtsUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
