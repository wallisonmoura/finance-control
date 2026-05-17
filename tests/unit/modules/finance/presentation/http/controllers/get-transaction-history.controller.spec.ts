import { TransactionHistoryOutput } from '@/modules/finance/application/dtos/transaction-history.output';
import { GetTransactionHistoryUseCase } from '@/modules/finance/application/use-cases/get-transaction-history.use-case';
import { FinancialEntryType } from '@/modules/finance/domain/enums/financial-entry-type.enum';
import { GetTransactionHistoryController } from '@/modules/finance/presentation/http/controllers/get-transaction-history.controller';

describe('GetTransactionHistoryController', () => {
  let useCase: jest.Mocked<GetTransactionHistoryUseCase>;
  let controller: GetTransactionHistoryController;

  beforeEach(() => {
    useCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetTransactionHistoryUseCase>;

    controller = new GetTransactionHistoryController(useCase);
  });

  it('deve retornar status 200 com histórico filtrado por período e tipo', async () => {
    const output: TransactionHistoryOutput = {
      entries: [
        {
          id: 'entry-1',
          userId: 'user-123',
          type: FinancialEntryType.INCOME,
          amount: 200,
          description: 'Corrida Uber',
          date: new Date(2026, 3, 1),
          categoryId: null,
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      totalIncome: 200,
      totalExpense: 0,
      balance: 200,
    };

    useCase.execute.mockResolvedValue(output);

    const response = await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
        type: FinancialEntryType.INCOME,
      },
    });

    expect(useCase.execute).toHaveBeenCalledTimes(1);

    const input = useCase.execute.mock.calls[0][0];

    expect(input.userId).toBe('user-123');
    expect(input.startDate).toBeInstanceOf(Date);
    expect(input.endDate).toBeInstanceOf(Date);

    expect(input.startDate.toISOString()).toBe('2026-04-01T00:00:00.000Z');

    expect(input.endDate.toISOString()).toBe('2026-05-01T00:00:00.000Z');

    expect(input.type).toBe(FinancialEntryType.INCOME);

    expect(response).toEqual({
      statusCode: 200,
      body: output,
    });
  });

  it('deve retornar status 200 quando o tipo não for informado', async () => {
    const output: TransactionHistoryOutput = {
      entries: [],
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    };

    useCase.execute.mockResolvedValue(output);

    await controller.handle({
      userId: 'user-123',
      query: {
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      },
    });

    const input = useCase.execute.mock.calls[0][0];

    expect(input.userId).toBe('user-123');
    expect(input.type).toBeUndefined();
  });

  it('deve lançar erro quando faltar startDate', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          endDate: '2026-04-30',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando faltar endDate', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-01',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando startDate for maior que endDate', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-30',
          endDate: '2026-04-01',
          type: FinancialEntryType.INCOME,
        },
      }),
    ).rejects.toThrow();
  });

  it('deve lançar erro quando o type for inválido', async () => {
    await expect(
      controller.handle({
        userId: 'user-123',
        query: {
          startDate: '2026-04-01',
          endDate: '2026-04-30',
          type: 'INVALID_TYPE',
        },
      }),
    ).rejects.toThrow();
  });
});
