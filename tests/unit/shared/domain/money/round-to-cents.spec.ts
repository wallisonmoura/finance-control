import { roundToCents } from '@/shared/domain/money/round-to-cents';

describe('roundToCents', () => {
  it('should fix floating-point drift from repeated decimal addition', () => {
    // Classic JS float artifact: 0.1 + 0.2 = 0.30000000000000004
    const dirtySum = 0.1 + 0.2;

    expect(dirtySum).not.toBe(0.3);
    expect(roundToCents(dirtySum)).toBe(0.3);
  });

  it('should keep an already-clean value unchanged', () => {
    expect(roundToCents(1500)).toBe(1500);
    expect(roundToCents(300.5)).toBe(300.5);
  });

  it('should round to the nearest cent, not truncate', () => {
    expect(roundToCents(10.005)).toBe(10.01);
    expect(roundToCents(10.004)).toBe(10.0);
  });

  it('should handle negative results correctly', () => {
    expect(roundToCents(-536.3900000000003)).toBe(-536.39);
  });

  it('should handle zero', () => {
    expect(roundToCents(0)).toBe(0);
  });
});
