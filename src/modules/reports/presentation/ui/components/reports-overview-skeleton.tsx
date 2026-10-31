import { ReportsChartSkeleton } from './reports-chart-skeleton';

// Same grid as ReportsPageContent: Receita × despesa full width on top, then
// Gastos por categoria and Dívidas pagas side by side.
export function ReportsOverviewSkeleton() {
  return (
    <div data-slot='reports-charts-grid' className='grid gap-6 xl:grid-cols-2'>
      <div className='xl:col-span-2'>
        <ReportsChartSkeleton />
      </div>

      <ReportsChartSkeleton />
      <ReportsChartSkeleton />
    </div>
  );
}
