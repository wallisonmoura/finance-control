import type { Metadata } from 'next';

import { getIncomeGoalTargets } from '@/modules/reports/presentation/server/get-income-goal-targets';
import { IncomeGoalHistoryPageContent } from '@/modules/reports/presentation/ui/components/income-goal-history-page-content';
import { getReportsMonthsFromSearchParamsRecord } from '@/modules/reports/presentation/ui/utils/reports-period';

export const metadata: Metadata = {
  title: 'Histórico do lucro',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfitHistoryPage({ searchParams }: PageProps) {
  const months = getReportsMonthsFromSearchParamsRecord((await searchParams) ?? {});
  const { targets, error } = await getIncomeGoalTargets();

  return (
    <IncomeGoalHistoryPageContent
      measure='profit'
      initialMonths={months}
      initialTargets={targets}
      targetsError={error}
    />
  );
}
