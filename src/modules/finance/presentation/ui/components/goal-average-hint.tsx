import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

// Passive hint to help choose a realistic limit; hidden without history.
// The label says which average it is: the goals tab uses the last 3 closed
// months with spending, the category history uses the selected period.
export function GoalAverageHint({
  average,
  label = 'Média dos últimos 3 meses',
}: {
  average: number | null | undefined;
  label?: string;
}) {
  if (average === null || average === undefined) {
    return null;
  }

  // Only a profit average can be negative: shown as "Média: -R$ X" it read
  // like a goal suggestion, but a goal must be above zero.
  if (average < 0) {
    return (
      <p className='text-xs text-muted-foreground'>
        {label} ficou negativa ({formatMoney(average)}).
      </p>
    );
  }

  return (
    <p className='text-xs text-muted-foreground'>
      {label}: {formatMoney(average)}
    </p>
  );
}
