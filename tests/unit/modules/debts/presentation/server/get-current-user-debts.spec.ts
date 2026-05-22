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
