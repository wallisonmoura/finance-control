import { FULL_PERIOD_PAGE_SIZE } from '@/modules/finance/constants/finance.constants';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { GetTransactionHistoryInput } from '@/modules/finance/application/dtos/get-transaction-history.input';
import { getFullTransactionHistoryQuerySchema } from '../schemas/get-full-transaction-history-query.schema';
import {
  parseDateFromQuery,
  parseExclusiveEndDateFromQuery,
} from '../schemas/shared/parse-date-from-query';
import { FinanceHttpPresenter } from '../presenters/finance-http.presenter';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';
import { TransactionHistoryResponseBody } from './get-transaction-history.controller';

export class GetFullTransactionHistoryController implements Controller<
  HttpRequest,
  TransactionHistoryResponseBody
> {
  constructor(
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<TransactionHistoryResponseBody>> {
    const query = getFullTransactionHistoryQuerySchema.parse(request.query);

    const input: GetTransactionHistoryInput = {
      userId: request.userId!,
      startDate: parseDateFromQuery(query.startDate),
      endDate: parseExclusiveEndDateFromQuery(query.endDate),
      type: query.type,
      categoryId: query.categoryId,
      page: 1,
      pageSize: FULL_PERIOD_PAGE_SIZE,
    };

    const result = await this.getTransactionHistoryUseCase.execute(input);

    return {
      statusCode: 200,
      body: {
        ...result,
        entries: FinanceHttpPresenter.toResponseList(result.entries),
      },
    };
  }
}
