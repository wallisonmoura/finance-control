import { FinancialEntryRepository } from '../../domain/repositories/financial-entry.repository';
import { GetTransactionHistoryInput } from '../dtos/get-transaction-history.input';
import { TransactionHistoryOutput } from '../dtos/transaction-history.output';

export class GetTransactionHistoryUseCase {
  constructor(
    private readonly financialEntryRepository: FinancialEntryRepository,
  ) {}

  async execute(
    input: GetTransactionHistoryInput,
  ): Promise<TransactionHistoryOutput> {
    const skip = (input.page - 1) * input.pageSize;

    const [totals, entries] = await Promise.all([
      this.financialEntryRepository.getPeriodTotals(
        input.userId,
        input.startDate,
        input.endDate,
        input.type,
        input.categoryId,
      ),
      this.financialEntryRepository.findByUserIdAndPeriodPaginated(
        input.userId,
        input.startDate,
        input.endDate,
        input.type,
        input.categoryId,
        { skip, take: input.pageSize },
      ),
    ]);

    return {
      entries: entries.map((entry) => entry.toJSON()),
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
      balance: totals.totalIncome - totals.totalExpense,
      pagination: {
        page: input.page,
        pageSize: input.pageSize,
        totalCount: totals.count,
        // Sem registros no período, não existe página nenhuma (0), em vez de
        // uma "página 1 vazia" — evita sugerir ao consumidor que há algo pra
        // paginar quando o período está genuinamente vazio.
        totalPages:
          totals.count === 0 ? 0 : Math.ceil(totals.count / input.pageSize),
      },
    };
  }
}
