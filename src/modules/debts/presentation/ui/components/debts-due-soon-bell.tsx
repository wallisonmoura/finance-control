'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Badge } from '@/shared/presentation/ui/primitives/badge';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/ui/primitives/popover';
import { getDaysUntil } from '@/shared/presentation/ui/lib/date';

import { DebtUi } from '../types/debt-ui.types';

type DebtsDueSoonBellProps = {
  initialDebts?: DebtUi[];
  initialError?: string | null;
};

const MAX_DAYS_UNTIL_DUE = 2;

type DueSoonDebt = {
  debt: DebtUi;
  daysUntil: number;
};

function getDueLabel(daysUntil: number): string {
  if (daysUntil === 0) {
    return 'Vence hoje';
  }

  if (daysUntil === 1) {
    return 'Vence amanhã';
  }

  return `Vence em ${daysUntil} dias`;
}

export function DebtsDueSoonBell({
  initialDebts = [],
  initialError = null,
}: DebtsDueSoonBellProps) {
  const dueSoonDebts = useMemo<DueSoonDebt[]>(() => {
    if (initialError) {
      return [];
    }

    return initialDebts
      .filter((debt) => debt.status === 'PENDING')
      .map((debt) => ({ debt, daysUntil: getDaysUntil(debt.dueDate) }))
      .filter(
        ({ daysUntil }) => daysUntil >= 0 && daysUntil <= MAX_DAYS_UNTIL_DUE,
      )
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [initialDebts, initialError]);

  const count = dueSoonDebts.length;

  return (
    <Popover>
      <PopoverTrigger
        type='button'
        aria-label='Dívidas vencendo em breve'
        className='relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-card px-0 text-foreground shadow-sm ring-1 ring-border transition-all hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50'
      >
        <Bell aria-hidden='true' className='size-5' />

        {count > 0 && (
          <Badge className='absolute -top-1 -right-1 h-5 min-w-5 justify-center rounded-full px-1'>
            {count}
          </Badge>
        )}
      </PopoverTrigger>

      <PopoverContent align='end' className='w-80 max-w-[calc(100vw-2rem)] p-0'>
        <div className='border-b border-border px-4 py-3'>
          <p className='text-sm font-semibold text-foreground'>
            Vencendo em breve
          </p>
        </div>

        {count === 0 ? (
          <p className='px-4 py-6 text-center text-sm text-muted-foreground'>
            Nenhuma dívida vencendo nos próximos dias
          </p>
        ) : (
          <ul className='max-h-72 overflow-y-auto'>
            {dueSoonDebts.map(({ debt, daysUntil }) => (
              <li
                key={debt.id}
                className='border-b border-border last:border-b-0'
              >
                <Link
                  href='/debts'
                  className='flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted'
                >
                  <span className='min-w-0'>
                    <span className='block truncate text-sm font-medium text-foreground'>
                      {debt.description}
                    </span>
                    <span className='block text-xs text-warning'>
                      {getDueLabel(daysUntil)}
                    </span>
                  </span>

                  <MoneyDisplay value={debt.amount} className='shrink-0 text-sm' />
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className='border-t border-border p-2'>
          <Button asChild variant='ghost' className='w-full justify-center'>
            <Link href='/debts'>Ver todas as dívidas</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
