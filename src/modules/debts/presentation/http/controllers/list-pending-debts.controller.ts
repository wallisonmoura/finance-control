import { ListPendingDebtsInput } from '@/modules/debts/application/dtos/list-pending-debts.input';
import { ListPendingDebtsUseCase } from '@/modules/debts/application/use-cases/list-pending-debts.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import {
  DebtHttpPresenter,
  DebtResponseBody,
} from '../presenters/debt-http.presenter';

export class ListPendingDebtsController implements Controller<
  HttpRequest,
  DebtResponseBody[]
> {
  constructor(
    private readonly listPendingDebtsUseCase: ListPendingDebtsUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtResponseBody[]>> {
    const input: ListPendingDebtsInput = {
      userId: request.userId!,
    };

    const output = await this.listPendingDebtsUseCase.execute(input);

    return {
      statusCode: 200,
      body: DebtHttpPresenter.toResponseList(output),
    };
  }
}
