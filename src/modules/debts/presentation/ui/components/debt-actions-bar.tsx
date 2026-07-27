import Link from 'next/link';
import { CheckCircle2, ListChecks, Plus } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';

type DebtActionsBarProps = {
  onCreateDebt: () => void;
};

export function DebtActionsBar({ onCreateDebt }: DebtActionsBarProps) {
  return (
    <div className='grid w-full gap-3 sm:grid-cols-3 lg:flex lg:w-auto lg:flex-wrap lg:justify-end'>
      <Button
        asChild
        variant='secondary'
        className='h-12 w-full justify-center lg:w-44'
      >
        <Link href='/debts/pending'>
          <ListChecks aria-hidden='true' className='size-4' />
          Ver pendentes
        </Link>
      </Button>

      <Button
        asChild
        variant='secondary'
        className='h-12 w-full justify-center lg:w-44'
      >
        <Link href='/debts/paid'>
          <CheckCircle2 aria-hidden='true' className='size-4' />
          Ver pagas
        </Link>
      </Button>

      <Button
        type='button'
        onClick={onCreateDebt}
        variant='custom'
        className='h-12 w-full justify-center px-6 bg-income text-primary-foreground hover:bg-income/90 lg:w-44'
      >
        <Plus aria-hidden='true' className='size-4' />
        Nova dívida
      </Button>
    </div>
  );
}
