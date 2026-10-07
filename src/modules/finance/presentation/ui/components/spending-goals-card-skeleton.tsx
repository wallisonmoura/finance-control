import { Target } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

const ROWS = [0, 1, 2];

export function SpendingGoalsCardSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Target aria-hidden='true' className='size-4 text-muted-foreground' />
        <h2>Metas do mês</h2>
      </div>

      <Card className='p-5'>
        <div className='space-y-4'>
          {ROWS.map((row) => (
            <div key={row} className='flex gap-3'>
              <Skeleton className='mt-1.5 size-2 shrink-0 rounded-full' />
              <div className='min-w-0 flex-1 space-y-1.5'>
                <Skeleton className='h-4 w-full max-w-32' />
                <Skeleton className='h-4 w-full max-w-48' />
                <Skeleton className='h-4 w-full max-w-64' />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
