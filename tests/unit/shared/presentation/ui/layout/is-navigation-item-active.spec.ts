import { isNavigationItemActive } from '@/shared/presentation/ui/layout/is-navigation-item-active';

describe('isNavigationItemActive', () => {
  it('should return true when pathname matches href exactly', () => {
    expect(isNavigationItemActive('/finance', '/finance')).toBe(true);
  });

  it('should return true when pathname is a subroute of href', () => {
    expect(isNavigationItemActive('/finance/incomes', '/finance')).toBe(true);
    expect(isNavigationItemActive('/finance/expenses', '/finance')).toBe(true);
    expect(isNavigationItemActive('/finance/history', '/finance')).toBe(true);
    expect(isNavigationItemActive('/wallet/edit', '/wallet')).toBe(true);
    expect(isNavigationItemActive('/debts/pending', '/debts')).toBe(true);
  });

  it('should return false when pathname is not related to href', () => {
    expect(isNavigationItemActive('/debts', '/finance')).toBe(false);
    expect(isNavigationItemActive('/wallet', '/debts')).toBe(false);
  });

  it('should only activate dashboard on exact match', () => {
    expect(isNavigationItemActive('/dashboard', '/dashboard')).toBe(true);
    expect(isNavigationItemActive('/dashboard/test', '/dashboard')).toBe(false);
  });

  it('should not match similar path prefixes', () => {
    expect(isNavigationItemActive('/financeiro', '/finance')).toBe(false);
    expect(isNavigationItemActive('/debts-old', '/debts')).toBe(false);
  });
});
