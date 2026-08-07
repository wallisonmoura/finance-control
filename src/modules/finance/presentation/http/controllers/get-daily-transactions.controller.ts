import { GetDailyTransactionsUseCase } from '@/modules/finance/application/use-cases/get-daily-transactions.use-case';
import { getDailyTransactionsQuerySchema } from '../schemas/get-daily-transactions-query.schema';
import { DailyTransactionsOutput } from '@/modules/finance/application/dtos/daily-transactions.output';
import { GetDailyTransactionsInput } from '@/modules/finance/application/dtos/get-daily-transactions.input';
import { parseDateFromQuery } from '../schemas/shared/parse-date-from-query';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export interface DailyTransactionsHttpResponse
  extends Omit<DailyTransactionsOutput, 'entries'> {
  entries: FinancialEntryHttpResponse[];
}

export class GetDailyTransactionsController implements Controller<
  HttpRequest,
  DailyTransactionsHttpResponse
> {
  constructor(
    private readonly getDailyTransactionsUseCase: GetDailyTransactionsUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<DailyTransactionsHttpResponse>> {
    const query = getDailyTransactionsQuerySchema.parse(request.query);

    const input: GetDailyTransactionsInput = {
      userId: request.userId!,
      date: parseDateFromQuery(query.date),
    };

    const result = await this.getDailyTransactionsUseCase.execute(input);

    return {
      statusCode: 200,
      body: {
        ...result,
        entries: FinanceHttpPresenter.toResponseList(result.entries),
      },
    };
  }
}
