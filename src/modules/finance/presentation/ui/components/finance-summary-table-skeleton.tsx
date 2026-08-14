import { CalendarDays } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { Skeleton } from '@/shared/presentation/ui/primitives/skeleton';

type FinanceSummaryTableSkeletonProps = {
  rowCount?: number;
};

export function FinanceSummaryTableSkeleton({
  rowCount = 5,
}: FinanceSummaryTableSkeletonProps) {
  return (
    <Card className='p-0'>
      <div className='flex items-center gap-2 border-b border-border px-5 py-4'>
        <CalendarDays
          aria-hidden='true'
          className='size-5 text-muted-foreground'
        />
        <h2 className='text-lg font-semibold text-foreground'>
          Resultado diário
        </h2>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full min-w-160 border-collapse text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted text-left text-sm text-muted-foreground'>
              <th className='w-24 px-5 py-3 font-semibold'>Dia</th>
              <th className='px-5 py-3 font-semibold'>Receita</th>
              <th className='px-5 py-3 font-semibold'>Despesa</th>
              <th className='px-5 py-3 font-semibold'>Resultado</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, index) => (
              <tr
                key={index}
                className='border-b border-border last:border-b-0'
              >
                <td className='px-5 py-3'>
                  <Skeleton className='h-4 w-6' />
                </td>
                <td className='px-5 py-3'>
                  <Skeleton className='h-4 w-16' />
                </td>
                <td className='px-5 py-3'>
                  <Skeleton className='h-4 w-16' />
                </td>
                <td className='px-5 py-3'>
                  <Skeleton className='h-6 w-28 rounded-full' />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
