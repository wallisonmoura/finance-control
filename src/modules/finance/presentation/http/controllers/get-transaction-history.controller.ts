import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { getTransactionHistoryQuerySchema } from '../schemas/get-transaction-history-query.schema';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { GetTransactionHistoryInput } from '@/modules/finance/application/dtos/get-transaction-history.input';
import {
  parseDateFromQuery,
  parseExclusiveEndDateFromQuery,
} from '../schemas/shared/parse-date-from-query';
import {
  FinanceHttpPresenter,
  FinancialEntryHttpResponse,
} from '../presenters/finance-http.presenter';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export interface TransactionHistoryHttpResponse
  extends Omit<TransactionHistoryOutput, 'entries'> {
  entries: FinancialEntryHttpResponse[];
}

export class GetTransactionHistoryController implements Controller<
  HttpRequest,
  TransactionHistoryHttpResponse
> {
  constructor(
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<TransactionHistoryHttpResponse>> {
    const query = getTransactionHistoryQuerySchema.parse(request.query);

    const input: GetTransactionHistoryInput = {
      userId: request.userId!,
      startDate: parseDateFromQuery(query.startDate),
      endDate: parseExclusiveEndDateFromQuery(query.endDate),
      type: query.type,
      categoryId: query.categoryId,
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
