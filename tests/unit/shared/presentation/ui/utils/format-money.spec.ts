import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

describe('formatMoney', () => {
  it('deve formatar valor monetário em BRL', () => {
    const result = formatMoney(1234.56);

    expect(result).toContain('R$');
    expect(result).toContain('1.234,56');
  });

  it('deve formatar zero em BRL', () => {
    const result = formatMoney(0);

    expect(result).toContain('R$');
    expect(result).toContain('0,00');
  });
});
