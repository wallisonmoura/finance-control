import { ListDebtsInput } from '@/modules/debts/application/dtos/list-debts.input';
import { ListDebtsUseCase } from '@/modules/debts/application/use-cases/list-debts.use-case';
import { Controller } from '@/shared/presentation/http/controller';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import {
  DebtHttpPresenter,
  DebtResponseBody,
} from '../presenters/debt-http.presenter';

export class ListDebtsController implements Controller<
  HttpRequest,
  DebtResponseBody[]
> {
  constructor(private readonly listDebtsUseCase: ListDebtsUseCase) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DebtResponseBody[]>> {
    const input: ListDebtsInput = {
      userId: request.userId!,
    };

    const output = await this.listDebtsUseCase.execute(input);

    return {
      statusCode: 200,
      body: DebtHttpPresenter.toResponseList(output),
    };
  }
}
