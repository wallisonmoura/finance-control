import { Gauge, TrendingUp } from 'lucide-react';

import { RouteLoadingRegion } from '@/shared/presentation/ui/components/skeletons/route-loading-region';
import { PageTitleSkeleton } from '@/shared/presentation/ui/components/skeletons/page-title-skeleton';
import { HeroCardSkeleton } from '@/shared/presentation/ui/components/skeletons/hero-card-skeleton';
import { StatCardGridSkeleton } from '@/shared/presentation/ui/components/skeletons/stat-card-grid-skeleton';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

export default function DashboardLoading() {
  return (
    <RouteLoadingRegion>
      <PageTitleSkeleton />
      <HeroCardSkeleton subStatsCount={2} />

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <Gauge aria-hidden='true' className='size-4 text-muted-foreground' />
          <h2>Composição dos saldos</h2>
        </div>

        <StatCardGridSkeleton count={3} />
      </div>

      <div className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
          <TrendingUp aria-hidden='true' className='size-4 text-accent' />
          <h2>Transações recentes</h2>
        </div>

        <ListRowsSkeleton count={5} />
      </div>
    </RouteLoadingRegion>
  );
}
