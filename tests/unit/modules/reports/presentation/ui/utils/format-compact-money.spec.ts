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

  it('should keep small values as they are', () => {
    expect(compact(750)).toBe('R$ 750');
  });
});
