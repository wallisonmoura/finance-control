import { roundToCents } from '@/shared/domain/money/round-to-cents';

export type WalletBaseBalances = {
  bankBalance: number;
  cashBalance: number;
  receivableBalance: number;
};

// RG15/RG51: walletTotal = bankBalance + cashBalance + receivableBalance.
// The single place the formula lives; derived, never persisted.
export function calculateWalletTotal(balances: WalletBaseBalances): number {
  return roundToCents(
    balances.bankBalance + balances.cashBalance + balances.receivableBalance,
  );
}
