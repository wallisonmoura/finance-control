import type { LucideIcon } from 'lucide-react';

import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { cn } from '@/shared/presentation/ui/lib/utils';

export type StatCardGridItem = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
  valueClassName?: string;
};

type StatCardGridProps = {
  items: StatCardGridItem[];
};

export function StatCardGrid({ items }: StatCardGridProps) {
  return (
    <div className='grid gap-4 lg:grid-cols-3'>
      {items.map((item) => (
        <Card key={item.label} className='p-5'>
          <div className='flex gap-4 lg:block lg:space-y-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-success-light text-accent ring-1 ring-accent/20'>
              <item.icon aria-hidden='true' className='size-6 text-accent' />
            </div>

            <div className='min-w-0 space-y-3'>
              <p className='text-sm font-medium text-foreground'>
                {item.label}
              </p>

              <MoneyDisplay
                value={item.value}
                className={cn(
                  'text-2xl font-semibold text-foreground',
                  item.valueClassName,
                )}
              />

              <p className='text-sm leading-6 text-muted-foreground'>
                {item.description}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
