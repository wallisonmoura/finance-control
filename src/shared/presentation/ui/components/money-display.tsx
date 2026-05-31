import { formatMoney } from '../utils/format-money';
import { cn } from '@/shared/presentation/ui/lib/utils';

type MoneyDisplayProps = {
  value: number;
  className?: string;
};

export function MoneyDisplay({ value, className = '' }: MoneyDisplayProps) {
  return (
    <strong
      className={cn(
        'block text-2xl font-bold tracking-tight text-foreground',
        className,
      )}
    >
      {formatMoney(value)}
    </strong>
  );
}
