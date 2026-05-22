import { FinanceHistoryPageContent } from '@/modules/finance/presentation/ui/components/finance-history-page-content';
import { getCurrentUserFinanceHistory } from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { getFinanceHistoryFiltersFromSearchParamsRecord } from '@/modules/finance/presentation/ui/utils/finance-filters';
import { LoadingState } from '@/shared/presentation/ui/components/loading-state';
import { Suspense } from 'react';

type FinanceHistoryPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FinanceHistoryPage({
  searchParams,
}: FinanceHistoryPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const filters =
    getFinanceHistoryFiltersFromSearchParamsRecord(resolvedSearchParams);
  const { data, error } = await getCurrentUserFinanceHistory(filters);

  return (
    <Suspense fallback={<LoadingState message='Carregando histórico financeiro...' />}>
      <FinanceHistoryPageContent
        initialHistory={data}
        initialError={error}
        initialFilters={filters}
      />
    </Suspense>
  );
}
