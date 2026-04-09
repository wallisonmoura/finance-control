import { GetDailyTransactionsUseCase } from '@/modules/finance/application/use-cases/get-daily-transactions.use-case';
import {
  GetDailyTransactionsQuery,
  getDailyTransactionsQuerySchema,
} from '../schemas/get-daily-transactions-query.schema';
import { Controller, HttpResponse } from './http.types';
import { DailyTransactionsOutput } from '@/modules/finance/application/dtos/daily-transactions.output';
import { GetDailyTransactionsInput } from '@/modules/finance/application/dtos/get-daily-transactions.input';
import { parseDateFromQuery } from '../schemas/shared/parse-date-from-query';

type GetDailyTransactionsControllerRequest = {
  userId: string;
  query: {
    date?: string;
  };
};

export class GetDailyTransactionsController implements Controller<
  GetDailyTransactionsControllerRequest,
  DailyTransactionsOutput
> {
  constructor(
    private readonly getDailyTransactionsUseCase: GetDailyTransactionsUseCase,
  ) {}

  async handle(
    request: GetDailyTransactionsControllerRequest,
  ): Promise<HttpResponse<DailyTransactionsOutput>> {
    const query = getDailyTransactionsQuerySchema.parse(request.query);

    const input: GetDailyTransactionsInput = {
      userId: request.userId,
      date: parseDateFromQuery(query.date),
    };

    const result = await this.getDailyTransactionsUseCase.execute(input);

    return {
      statusCode: 200,
      body: result,
    };
  }
}
