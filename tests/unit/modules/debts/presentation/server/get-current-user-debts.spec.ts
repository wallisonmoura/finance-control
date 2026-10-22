import { getAuthenticatedUserId } from '@/modules/auth/presentation/server/get-authenticated-user-id';
import { makeListDebtsUseCase } from '@/modules/debts/infra/factories/make-list-debts-use-case';
import { makeListPendingDebtsUseCase } from '@/modules/debts/infra/factories/make-list-pending-debts-use-case';
import {
  getCurrentUserDebts,
  getCurrentUserPendingDebts,
} from '@/modules/debts/presentation/server/get-current-user-debts';

jest.mock('@/modules/auth/presentation/server/get-authenticated-user-id', () => ({
  getAuthenticatedUserId: jest.fn(),
}));
jest.mock('@/modules/debts/infra/factories/make-list-debts-use-case', () => ({
  makeListDebtsUseCase: jest.fn(),
}));
jest.mock(
  '@/modules/debts/infra/factories/make-list-pending-debts-use-case',
  () => ({
    makeListPendingDebtsUseCase: jest.fn(),
  }),
);

const getAuthenticatedUserIdMock = jest.mocked(getAuthenticatedUserId);
const makeListDebtsUseCaseMock = jest.mocked(makeListDebtsUseCase);
const makeListPendingDebtsUseCaseMock = jest.mocked(
  makeListPendingDebtsUseCase,
);

const debt = {
  id: 'debt-id',
  userId: 'user-id',
  description: 'Seguro do carro',
  amount: 300,
  dueDate: new Date('2026-05-20T00:00:00.000Z'),
  type: 'ONE_TIME' as const,
  status: 'PENDING' as const,
  notes: null,
  paidAt: null,
  paymentSource: null,
  createdAt: new Date('2026-05-16T00:00:00.000Z'),
  updatedAt: new Date('2026-05-16T00:00:00.000Z'),
};

describe('getCurrentUserDebts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return unauthenticated error when there is no current user', async () => {
    getAuthenticatedUserIdMock.mockResolvedValueOnce(null);

    await expect(getCurrentUserDebts()).resolves.toEqual({
      error: 'Não autenticado',
    });

    expect(makeListDebtsUseCaseMock).not.toHaveBeenCalled();
  });

  it('should return debts for the authenticated user', async () => {
    const execute = jest.fn().mockResolvedValueOnce([debt]);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListDebtsUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListDebtsUseCase>);

    await expect(getCurrentUserDebts()).resolves.toEqual({
      data: [
        {
          ...debt,
          dueDate: '2026-05-20T00:00:00.000Z',
          paidAt: null,
          paymentRecordedAt: null,
          createdAt: '2026-05-16T00:00:00.000Z',
          updatedAt: '2026-05-16T00:00:00.000Z',
        },
      ],
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });

  it('should return generic error message when debts loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListDebtsUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListDebtsUseCase>);

    await expect(getCurrentUserDebts()).resolves.toEqual({
      error: 'Não foi possível carregar dívidas.',
    });
  });
});

describe('getCurrentUserDebts payment undo fields', () => {
  it('should send the payment time as a full ISO timestamp and keep the recurrence link on the server', async () => {
    const execute = jest.fn().mockResolvedValueOnce([
      {
        ...debt,
        status: 'PAID' as const,
        paidAt: new Date('2026-10-20T00:00:00.000Z'),
        paymentSource: 'BANK' as const,
        paymentRecordedAt: new Date('2026-10-21T15:04:05.000Z'),
        generatedFromDebtId: 'debt-0',
      },
    ]);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListDebtsUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListDebtsUseCase>);

    const result = await getCurrentUserDebts();

    expect(result.data?.[0].paymentRecordedAt).toBe('2026-10-21T15:04:05.000Z');
    expect(result.data?.[0]).not.toHaveProperty('generatedFromDebtId');
  });
});

describe('getCurrentUserPendingDebts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return pending debts for the authenticated user', async () => {
    const execute = jest.fn().mockResolvedValueOnce([debt]);

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListPendingDebtsUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListPendingDebtsUseCase>);

    await expect(getCurrentUserPendingDebts()).resolves.toMatchObject({
      data: [
        {
          id: 'debt-id',
          dueDate: '2026-05-20T00:00:00.000Z',
        },
      ],
    });

    expect(execute).toHaveBeenCalledWith({
      userId: 'user-id',
    });
  });

  it('should return generic error message when pending debts loading fails', async () => {
    const execute = jest.fn().mockRejectedValueOnce(new Error('DB down'));

    getAuthenticatedUserIdMock.mockResolvedValueOnce('user-id');
    makeListPendingDebtsUseCaseMock.mockReturnValueOnce({
      execute,
    } as unknown as ReturnType<typeof makeListPendingDebtsUseCase>);

    await expect(getCurrentUserPendingDebts()).resolves.toEqual({
      error: 'Não foi possível carregar dívidas pendentes.',
    });
  });
});
