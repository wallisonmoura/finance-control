import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

describe('formatMoney', () => {
  it('should format a monetary value in BRL', () => {
    const result = formatMoney(1234.56);

    expect(result).toContain('R$');
    expect(result).toContain('1.234,56');
  });

  it('should format zero in BRL', () => {
    const result = formatMoney(0);

    expect(result).toContain('R$');
    expect(result).toContain('0,00');
  });
});
