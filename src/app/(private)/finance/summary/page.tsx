import { FinanceSummaryPageContent } from '@/modules/finance/presentation/ui/components/finance-summary-page-content';
import { getCurrentUserOperationalSummary } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { getOperationalSummaryFiltersFromSearchParamsRecord } from '@/modules/finance/presentation/ui/utils/finance-operational-summary';
import { LoadingState } from '@/shared/presentation/ui/components/loading-state';
import { Suspense } from 'react';

type FinanceSummaryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FinanceSummaryPage({
  searchParams,
}: FinanceSummaryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters =
    getOperationalSummaryFiltersFromSearchParamsRecord(resolvedSearchParams);
  const { monthlySummary, dailyRows, error } =
    await getCurrentUserOperationalSummary(filters);

  return (
    <Suspense fallback={<LoadingState message='Carregando resumo financeiro...' />}>
      <FinanceSummaryPageContent
        initialMonthlySummary={monthlySummary}
        initialDailyRows={dailyRows}
        initialError={error}
        initialFilters={filters}
      />
    </Suspense>
  );
}
