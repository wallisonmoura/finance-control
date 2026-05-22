import Link from 'next/link';
import {
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ListChecks,
  Plus,
} from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { DebtUi } from '../types/debt-ui.types';

type DebtOverviewSummaryProps = {
  debts: DebtUi[];
  onCreateDebt: () => void;
};

type DebtIndicator =
  | {
      kind: 'count';
      label: string;
      value: number;
      icon: typeof Clock3;
      toneClassName: string;
    }
  | {
      kind: 'money';
      label: string;
      value: number;
      icon: typeof Clock3;
      toneClassName: string;
    };

function sumDebts(debts: DebtUi[]) {
  return debts.reduce((total, debt) => total + debt.amount, 0);
}

export function DebtOverviewSummary({
  debts,
  onCreateDebt,
}: DebtOverviewSummaryProps) {
  const pendingDebts = debts.filter((debt) => debt.status === 'PENDING');
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  const pendingTotal = sumDebts(pendingDebts);
  const paidTotal = sumDebts(paidDebts);
  const indicators: DebtIndicator[] = [
    {
      kind: 'count',
      label: 'Dívidas pendentes',
      value: pendingDebts.length,
      icon: Clock3,
      toneClassName: 'text-amber-700',
    },
    {
      kind: 'money',
      label: 'Valor pendente',
      value: pendingTotal,
      icon: CircleDollarSign,
      toneClassName: 'text-red-700',
    },
    {
      kind: 'count',
      label: 'Dívidas pagas',
      value: paidDebts.length,
      icon: CheckCircle2,
      toneClassName: 'text-emerald-700',
    },
    {
      kind: 'money',
      label: 'Valor pago',
      value: paidTotal,
      icon: CircleDollarSign,
      toneClassName: 'text-emerald-700',
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
        {indicators.map((indicator) => (
          <Card key={indicator.label}>
            <div className='flex items-center gap-2 text-sm text-slate-500'>
              <indicator.icon
                aria-hidden='true'
                className={`size-4 ${indicator.toneClassName}`}
              />
              <p>{indicator.label}</p>
            </div>

            {indicator.kind === 'money' ? (
              <MoneyDisplay
                value={indicator.value}
                className={`mt-2 text-xl font-bold sm:text-2xl ${indicator.toneClassName}`}
              />
            ) : (
              <strong
                className={`mt-2 block text-xl font-bold sm:text-2xl ${indicator.toneClassName}`}
              >
                {indicator.value}
              </strong>
            )}
          </Card>
        ))}
      </div>

      <div className='grid gap-2 sm:flex sm:flex-wrap sm:justify-end'>
        <Button asChild variant='secondary' className='w-full sm:w-auto'>
          <Link href='/debts/pending'>
            <ListChecks aria-hidden='true' className='size-4' />
            Ver pendentes
          </Link>
        </Button>

        <Button asChild variant='secondary' className='w-full sm:w-auto'>
          <Link href='/debts/paid'>
            <CheckCircle2 aria-hidden='true' className='size-4' />
            Ver pagas
          </Link>
        </Button>

        <Button
          type='button'
          onClick={onCreateDebt}
          className='w-full sm:w-auto'
        >
          <Plus aria-hidden='true' className='size-4' />
          Nova dívida
        </Button>
      </div>
    </div>
  );
}
