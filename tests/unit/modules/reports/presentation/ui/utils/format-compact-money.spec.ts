import { formatCompactMoney } from '@/modules/reports/presentation/ui/utils/format-compact-money';

// Intl uses non-breaking spaces; compare with plain ones.
const compact = (value: number) => formatCompactMoney(value).replace(/ /g, ' ');

describe('formatCompactMoney', () => {
  it('should shorten axis values so they fit on a phone', () => {
    expect(compact(0)).toBe('R$ 0');
    expect(compact(2500)).toBe('R$ 2,5 mil');
    expect(compact(10000)).toBe('R$ 10 mil');
    expect(compact(1500000)).toBe('R$ 1,5 mi');
  });

  // The axis scale steps by 1, 2, 2.5 and 5 × 10ⁿ: one decimal turned the
  // 1.250 step into "R$ 1,3 mil", a wrong label.
  it('should keep every axis step exact', () => {
    expect(compact(1250)).toBe('R$ 1,25 mil');
    expect(compact(1750)).toBe('R$ 1,75 mil');
    expect(compact(1250000)).toBe('R$ 1,25 mi');
  });

  it('should keep small values as they are', () => {
    expect(compact(750)).toBe('R$ 750');
  });
});
