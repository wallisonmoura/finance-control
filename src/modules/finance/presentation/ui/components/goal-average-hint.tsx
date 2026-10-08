import { formatMoney } from '@/shared/presentation/ui/utils/format-money';

// Passive hint to help choose a realistic limit; hidden without history.
export function GoalAverageHint({ average }: { average: number | null | undefined }) {
  if (average === null || average === undefined) {
    return null;
  }

  return (
    <p className='text-xs text-muted-foreground'>
      Média dos últimos 3 meses: {formatMoney(average)}
    </p>
  );
}
