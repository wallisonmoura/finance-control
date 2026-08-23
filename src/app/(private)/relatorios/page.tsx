import type { Metadata } from 'next';

import { ReportsPageContent } from '@/modules/reports/presentation/ui/components/reports-page-content';
import { getReportsMonthsFromSearchParamsRecord } from '@/modules/reports/presentation/ui/utils/reports-period';

export const metadata: Metadata = {
  title: 'Relatórios',
};

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const months = getReportsMonthsFromSearchParamsRecord(resolvedSearchParams);

  return <ReportsPageContent initialMonths={months} />;
}
