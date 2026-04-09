import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { Controller, HttpResponse } from './http.types';
import {
  GetTransactionHistoryQuery,
  getTransactionHistoryQuerySchema,
} from '../schemas/get-transaction-history-query.schema';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { GetTransactionHistoryInput } from '@/modules/finance/application/dtos/get-transaction-history.input';
import { parseDateFromQuery } from '../schemas/shared/parse-date-from-query';

type GetTransactionHistoryControllerRequest = {
  userId: string;
  query: {
    startDate?: string;
    endDate?: string;
    type?: string;
  };
};

export class GetTransactionHistoryController implements Controller<
  GetTransactionHistoryControllerRequest,
  TransactionHistoryOutput
> {
  constructor(
    private readonly getTransactionHistoryUseCase: GetTransactionHistoryUseCase,
  ) {}

  async handle(
    request: GetTransactionHistoryControllerRequest,
  ): Promise<HttpResponse<TransactionHistoryOutput>> {
    const query = getTransactionHistoryQuerySchema.parse(request.query);

    const input: GetTransactionHistoryInput = {
      userId: request.userId,
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
