import { Lightbulb } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { cn } from '@/shared/presentation/ui/lib/utils';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

const COLUMNS = [0, 1];
const ROWS = [0, 1, 2];

export function MonthlyInsightsCardSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
        <Lightbulb aria-hidden='true' className='size-4 text-muted-foreground' />
        <h2>Insights do mês</h2>
      </div>

      <Card className='p-0'>
        <div className='grid lg:grid-cols-2'>
          {COLUMNS.map((column) => (
            <div
              key={column}
              className={cn(
                'space-y-4 p-5',
                column === 1 && 'border-t border-border lg:border-t-0 lg:border-l',
              )}
            >
              <Skeleton className='h-4 w-20' />
              {ROWS.map((row) => (
                <div key={row} className='flex gap-3'>
                  <Skeleton className='mt-1.5 size-2 shrink-0 rounded-full' />
                  <Skeleton className='h-4 w-full max-w-md' />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
