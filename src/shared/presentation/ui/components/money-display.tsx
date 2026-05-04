import { formatMoney } from '../utils/format-money';

type MoneyDisplayProps = {
  value: number;
  className?: string;
};

export function MoneyDisplay({ value, className = '' }: MoneyDisplayProps) {
  return (
    <strong
      className={[
        'block text-2xl font-bold tracking-tight text-slate-950',
        className,
      ].join(' ')}
    >
      {formatMoney(value)}
    </strong>
  );
}
