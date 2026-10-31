const compactMoney = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  notation: 'compact',
  // Two decimals keep every axis step exact (1.250 → "R$ 1,25 mil").
  maximumFractionDigits: 2,
});

// Short axis labels ("R$ 2,5 mil", "R$ 1,25 mi") that fit on a phone and in
// the fixed axis width even for millions; tooltips and tables keep the exact
// value.
export function formatCompactMoney(value: number): string {
  return compactMoney.format(value);
}
