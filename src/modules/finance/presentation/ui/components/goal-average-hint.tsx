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

  return (
    <p className='text-xs text-muted-foreground'>
      {label}: {formatMoney(average)}
    </p>
  );
}
