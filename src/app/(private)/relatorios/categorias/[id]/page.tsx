import type { Metadata } from 'next';

import { CategoryHistoryPageContent } from '@/modules/reports/presentation/ui/components/category-history-page-content';
import { getReportsMonthsFromSearchParamsRecord } from '@/modules/reports/presentation/ui/utils/reports-period';

export const metadata: Metadata = {
  title: 'Histórico da categoria',
};

type CategoryHistoryPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CategoryHistoryPage({
  params,
  searchParams,
}: CategoryHistoryPageProps) {
  const { id } = await params;
  const months = getReportsMonthsFromSearchParamsRecord((await searchParams) ?? {});

  return <CategoryHistoryPageContent key={id} categoryId={id} initialMonths={months} />;
}
