import { DebtOutput } from '@/modules/debts/application/dtos/debt.output';
import { ListDebtsInput } from '@/modules/debts/application/dtos/list-debts.input';
import { ListDebtsUseCase } from '@/modules/debts/application/use-cases/list-debts.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';

export class ListDebtsController implements Controller<
  HttpRequest,
  DebtOutput[]
> {
  constructor(private readonly listDebtsUseCase: ListDebtsUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse<DebtOutput[]>> {
    const input: ListDebtsInput = {
      userId: request.userId!,
    };

    const output = await this.listDebtsUseCase.execute(input);

    return {
      statusCode: 200,
      body: output,
    };
  }
}
