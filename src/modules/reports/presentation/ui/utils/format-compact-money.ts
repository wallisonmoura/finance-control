const compactMoney = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  maximumFractionDigits: 1,
});

// Short axis labels ("R$ 2,5 mil") that fit on a phone; tooltips and tables
// keep the exact value.
export function formatCompactMoney(value: number): string {
  return compactMoney.format(value);
}
