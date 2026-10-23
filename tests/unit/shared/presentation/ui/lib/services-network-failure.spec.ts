import * as authApi from '@/modules/auth/presentation/ui/services/auth-api.service';
import * as debtApi from '@/modules/debts/presentation/ui/services/debt-api.service';
import * as financeApi from '@/modules/finance/presentation/ui/services/finance-api.service';
import * as walletApi from '@/modules/wallet/presentation/ui/services/wallet-api.service';
import { NETWORK_ERROR_MESSAGE } from '@/shared/presentation/ui/lib/api-fetch';

// Every call the app makes to the server must explain a lost connection
// instead of failing silently (the button just blinked before). One row per
// exported service function, so a new function that skips apiFetch fails here.
const anyInput = {} as never;
const calls: [string, () => Promise<{ error?: string }>][] = [
  ['signIn', () => authApi.signIn(anyInput)],
  ['signUp', () => authApi.signUp(anyInput)],
  ['signOut', () => authApi.signOut()],
  ['getCurrentUser', () => authApi.getCurrentUser()],
  ['updateProfile', () => authApi.updateProfile(anyInput)],
  ['changePassword', () => authApi.changePassword(anyInput)],
  ['getDebts', () => debtApi.getDebts()],
  ['getPendingDebts', () => debtApi.getPendingDebts()],
  ['registerDebt', () => debtApi.registerDebt(anyInput)],
  ['registerInstallmentDebt', () => debtApi.registerInstallmentDebt(anyInput)],
  ['updateDebt', () => debtApi.updateDebt('id', anyInput)],
  ['deleteDebt', () => debtApi.deleteDebt('id')],
  ['payDebt', () => debtApi.payDebt('id', anyInput)],
  ['undoDebtPayment', () => debtApi.undoDebtPayment('id')],
  ['registerIncome', () => financeApi.registerIncome(anyInput)],
  ['registerExpense', () => financeApi.registerExpense(anyInput)],
  ['updateIncome', () => financeApi.updateIncome('id', anyInput)],
  ['updateExpense', () => financeApi.updateExpense('id', anyInput)],
  ['deleteIncome', () => financeApi.deleteIncome('id')],
  ['deleteExpense', () => financeApi.deleteExpense('id')],
  [
    'getFinanceHistory',
    () => financeApi.getFinanceHistory({ startDate: '2026-10-01', endDate: '2026-10-31' } as never),
  ],
  [
    'getFullFinanceHistory',
    () => financeApi.getFullFinanceHistory({ startDate: '2026-10-01', endDate: '2026-10-31' } as never),
  ],
  ['getExpenseCategories', () => financeApi.getExpenseCategories()],
  ['getDailyProfit', () => financeApi.getDailyProfit('2026-10-23')],
  ['getMonthlySummary', () => financeApi.getMonthlySummary({ year: 2026, month: 10 })],
  ['getMonthlySummaryRange', () => financeApi.getMonthlySummaryRange(6)],
  ['setCategoryMonthlyLimit', () => financeApi.setCategoryMonthlyLimit('id', 100)],
  ['setIncomeGoals', () => financeApi.setIncomeGoals(anyInput)],
  ['getWallet', () => walletApi.getWallet()],
  ['updateWalletBalances', () => walletApi.updateWalletBalances(anyInput)],
];

describe('API services without a connection', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));
  });

  it('should cover every exported service function', () => {
    const exported = [authApi, debtApi, financeApi, walletApi].flatMap((service) =>
      Object.entries(service)
        .filter(([, value]) => typeof value === 'function')
        .map(([name]) => name),
    );

    expect(calls.map(([name]) => name).sort()).toEqual(exported.sort());
  });

  it.each(calls)('should return the no-connection message from %s', async (_name, call) => {
    await expect(call()).resolves.toEqual({ error: NETWORK_ERROR_MESSAGE });
  });
});
