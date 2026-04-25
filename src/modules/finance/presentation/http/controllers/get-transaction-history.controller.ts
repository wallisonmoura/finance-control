import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { getTransactionHistoryQuerySchema } from '../schemas/get-transaction-history-query.schema';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { GetTransactionHistoryInput } from '@/modules/finance/application/dtos/get-transaction-history.input';
import { parseDateFromQuery } from '../schemas/shared/parse-date-from-query';
import {
  HttpRequest,
  HttpResponse,
} from '@/shared/presentation/http/http.types';
import { Controller } from '@/shared/presentation/http/controller';

export class GetTransactionHistoryController implements Controller<
  HttpRequest,
  TransactionHistoryOutput
> {
  constructor(
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
  ) {}

  async handle(
    request: HttpRequest,
  ): Promise<HttpResponse<TransactionHistoryOutput>> {
    const query = getTransactionHistoryQuerySchema.parse(request.query);

    const input: GetTransactionHistoryInput = {
      userId: request.userId!,
      startDate: parseDateFromQuery(query.startDate),
      endDate: parseDateFromQuery(query.endDate),
      type: query.type,
    };

    const result = await this.getTransactionHistoryUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
