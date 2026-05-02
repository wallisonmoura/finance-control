import { PATCH } from '@/app/api/debts/[id]/pay/route';
import { getAuthenticatedUserIdFromRequest } from '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request';
import { DebtPaymentSource } from '@/modules/debts/domain/enums/debt-payment-source.enum';
import { DebtStatus } from '@/modules/debts/domain/enums/debt-status.enum';
import { DebtType } from '@/modules/debts/domain/enums/debt-type.enum';
import { prisma } from '@/shared/infra/database/prisma/client';
import { NextRequest } from 'next/server';
import { createTestExpenseCategory } from 'tests/helpers/database/create-test-expense-category';
import { createTestUser } from 'tests/helpers/database/create-test-user';
import { createTestWallet } from 'tests/helpers/database/create-test-wallet';
import { createTestDebt } from 'tests/helpers/database/create-test-debt';

jest.mock(
  '@/modules/auth/presentation/http/helpers/get-authenticated-user-id-from-request',
  () => ({
    getAuthenticatedUserIdFromRequest: jest.fn(),
  }),
);

const mockedGetAuthenticatedUserIdFromRequest =
  getAuthenticatedUserIdFromRequest as jest.Mock;

describe('PATCH /api/debts/[id]/pay', () => {
  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.debt.deleteMany();
    await prisma.expenseCategory.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
  });

  it('deve pagar uma dívida usando BANK, criar expense e debitar a wallet', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 200,
      receivableBalance: 500,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Parcela do cartão',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);

    expect(body).toMatchObject({
      id: debt.id,
      userId: user.id,
      amount: 150.75,
      description: 'Parcela do cartão',
      status: DebtStatus.PAID,
      paymentSource: DebtPaymentSource.BANK,
    });

    expect(body.paidAt).not.toBeNull();

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(debtOnDatabase).not.toBeNull();
    expect(debtOnDatabase?.status).toBe(DebtStatus.PAID);
    expect(debtOnDatabase?.paymentSource).toBe(DebtPaymentSource.BANK);
    expect(debtOnDatabase?.paidAt).not.toBeNull();

    const transactionOnDatabase = await prisma.transaction.findFirst({
      where: {
        debtId: debt.id,
      },
    });

    expect(transactionOnDatabase).not.toBeNull();
    expect(transactionOnDatabase?.type).toBe('EXPENSE');
    expect(Number(transactionOnDatabase?.amount)).toBe(150.75);
    expect(transactionOnDatabase?.description).toBe(
      'Pagamento de dívida: Parcela do cartão',
    );
    expect(transactionOnDatabase?.expenseCategoryId).toBe(category.id);
    expect(transactionOnDatabase?.userId).toBe(user.id);

    const walletOnDatabase = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(walletOnDatabase).not.toBeNull();
    expect(Number(walletOnDatabase?.bankBalance)).toBe(849.25);
    expect(Number(walletOnDatabase?.cashBalance)).toBe(200);
    expect(Number(walletOnDatabase?.receivableBalance)).toBe(500);
  });

  it('deve pagar uma dívida usando CASH e debitar cashBalance', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 300,
      receivableBalance: 500,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 100,
      description: 'Dívida em dinheiro',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.CASH,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(DebtStatus.PAID);
    expect(body.paymentSource).toBe(DebtPaymentSource.CASH);

    const walletOnDatabase = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(Number(walletOnDatabase?.bankBalance)).toBe(1000);
    expect(Number(walletOnDatabase?.cashBalance)).toBe(200);
    expect(Number(walletOnDatabase?.receivableBalance)).toBe(500);
  });

  it('deve pagar uma dívida usando RECEIVABLE e debitar receivableBalance', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 300,
      receivableBalance: 500,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 250,
      description: 'Dívida via recebível',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.RECEIVABLE,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe(DebtStatus.PAID);
    expect(body.paymentSource).toBe(DebtPaymentSource.RECEIVABLE);

    const walletOnDatabase = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(Number(walletOnDatabase?.bankBalance)).toBe(1000);
    expect(Number(walletOnDatabase?.cashBalance)).toBe(300);
    expect(Number(walletOnDatabase?.receivableBalance)).toBe(250);
  });

  it('deve retornar 401 quando o usuário não estiver autenticado', async () => {
    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000/pay',
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: '660e8400-e29b-41d4-a716-446655440000',
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 400 quando o id da dívida for inválido', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/id-invalido/pay',
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: '660e8400-e29b-41d4-a716-446655440000',
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: 'id-invalido',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
  });

  it('deve retornar 400 quando o payload for inválido', async () => {
    const user = await createTestUser();

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000/pay',
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-99-99',
          expenseCategoryId: 'categoria-invalida',
          paymentSource: 'PIX',
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe('Erro de validação.');
    expect(body.issues).toBeDefined();
  });

  it('deve retornar 404 quando a dívida não existir ou pertencer a outro usuário', async () => {
    const user = await createTestUser();

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      'http://localhost:3000/api/debts/550e8400-e29b-41d4-a716-446655440000/pay',
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: '550e8400-e29b-41d4-a716-446655440000',
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toHaveProperty('message');
  });

  it('deve retornar 409 ao tentar pagar uma dívida já paga', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 1000,
      cashBalance: 300,
      receivableBalance: 500,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida já paga',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PAID,
      notes: null,
      paidAt: new Date('2026-05-12T00:00:00.000Z'),
      paymentSource: DebtPaymentSource.BANK,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body).toHaveProperty('message');

    const transactions = await prisma.transaction.findMany({
      where: {
        debtId: debt.id,
      },
    });

    expect(transactions).toHaveLength(0);
  });

  it('deve retornar 422 e manter rollback quando a wallet não tiver saldo suficiente', async () => {
    const user = await createTestUser();

    const wallet = await createTestWallet({
      userId: user.id,
      bankBalance: 10,
      cashBalance: 0,
      receivableBalance: 0,
    });

    const category = await createTestExpenseCategory({
      userId: user.id,
      name: 'Parcelas',
      slug: 'parcelas',
      isActive: true,
    });

    const debt = await createTestDebt({
      userId: user.id,
      walletId: wallet.id,
      amount: 150.75,
      description: 'Dívida sem saldo',
      dueDate: new Date('2026-05-10T00:00:00.000Z'),
      type: DebtType.ONE_TIME,
      status: DebtStatus.PENDING,
      notes: null,
      paidAt: null,
      paymentSource: null,
    });

    mockedGetAuthenticatedUserIdFromRequest.mockResolvedValue(user.id);

    const request = new NextRequest(
      `http://localhost:3000/api/debts/${debt.id}/pay`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          paidAt: '2026-05-12',
          expenseCategoryId: category.id,
          paymentSource: DebtPaymentSource.BANK,
        }),
      },
    );

    const response = await PATCH(request, {
      params: Promise.resolve({
        id: debt.id,
      }),
    });

    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toHaveProperty('message');

    const debtOnDatabase = await prisma.debt.findUnique({
      where: {
        id: debt.id,
      },
    });

    expect(debtOnDatabase?.status).toBe(DebtStatus.PENDING);
    expect(debtOnDatabase?.paidAt).toBeNull();
    expect(debtOnDatabase?.paymentSource).toBeNull();

    const transactions = await prisma.transaction.findMany({
      where: {
        debtId: debt.id,
      },
    });

    expect(transactions).toHaveLength(0);

    const walletOnDatabase = await prisma.wallet.findUnique({
      where: {
        id: wallet.id,
      },
    });

    expect(Number(walletOnDatabase?.bankBalance)).toBe(10);
  });
});
