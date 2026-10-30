import { calculateWalletTotal } from '@/modules/wallet/domain/services/calculate-wallet-total';

describe('calculateWalletTotal', () => {
  it('should sum the three base balances', () => {
    expect(
      calculateWalletTotal({ bankBalance: 1000, cashBalance: 200, receivableBalance: 300 }),
    ).toBe(1500);
  });

  it('should round the sum to cents instead of leaking floating-point drift', () => {
    // Plain addition gives 1700.9999999999998.
    expect(
      calculateWalletTotal({ bankBalance: 1500.3, cashBalance: 200.6, receivableBalance: 0.1 }),
    ).toBe(1701);
  });
});
