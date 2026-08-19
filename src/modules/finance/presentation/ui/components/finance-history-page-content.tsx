'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { ListRowsSkeleton } from '@/shared/presentation/ui/components/skeletons/list-rows-skeleton';

import {
  getFinanceHistoryFiltersFromUrlSearchParams,
} from '../utils/finance-filters';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { FinanceHistoryFilters } from './finance-history-filters';
import { FinanceHistoryList } from './finance-history-list';
import { FinanceHistorySummary } from './finance-history-summary';
import { FinanceHistorySummarySkeleton } from './finance-history-summary-skeleton';
import {
  ExpenseCategoryUi,
  FinanceHistoryFiltersUi,
  FinanceHistoryUi,
} from '../types/finance-ui.types';
import { FinanceBackLink } from './finance-back-link';

function toFinanceHistoryUrl(filters: FinanceHistoryFiltersUi): string {
  const searchParams = new URLSearchParams({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  if (filters.type) {
    searchParams.set('type', filters.type);
  }

  if (filters.categoryId) {
    searchParams.set('categoryId', filters.categoryId);
  }

  searchParams.set('page', String(filters.page));

  return `/finance/history?${searchParams.toString()}`;
}

function areFiltersEqual(
  first: FinanceHistoryFiltersUi,
  second: FinanceHistoryFiltersUi,
): boolean {
  return (
    first.startDate === second.startDate &&
    first.endDate === second.endDate &&
    first.type === second.type &&
    first.categoryId === second.categoryId &&
    first.page === second.page
  );
}

type FinanceHistoryPageContentProps = {
  initialHistory?: FinanceHistoryUi;
  initialError?: string | null;
  initialFilters?: FinanceHistoryFiltersUi;
  initialCategories?: ExpenseCategoryUi[];
};

export function FinanceHistoryPageContent({
  initialHistory,
  initialError,
  initialFilters,
  initialCategories = [],
}: FinanceHistoryPageContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => getFinanceHistoryFiltersFromUrlSearchParams(searchParams),
    [searchParams],
  );

  const hookInitialParams = useMemo(
    () => ({
      ...urlFilters,
      ...(initialFilters && areFiltersEqual(initialFilters, urlFilters)
        ? {
            initialData: initialHistory ?? null,
            initialError: initialError ?? null,
          }
        : {}),
    }),
    [initialError, initialFilters, initialHistory, urlFilters],
  );

  const {
    entries,
    totalIncome,
    totalExpense,
    balance,
    pagination,
    filters,
    isLoading,
    error,
    applyFilters,
    refresh,
  } = useFinanceHistory(hookInitialParams);

  // The URL is the single source of truth for filters: pushing it here and
  // letting the effect below react to the resulting urlFilters change is
  // what actually triggers the fetch. Calling applyFilters directly here too
  // used to race that effect — filters state update lands before the URL's
  // searchParams catch up, so the effect would see a stale urlFilters and
  // fire a spurious extra fetch with the old filters, then a third one once
  // the URL caught up. See the regression test for the reproduction.
  const handleApplyFilters = useCallback(
    (nextFilters: FinanceHistoryFiltersUi) => {
      router.push(toFinanceHistoryUrl(nextFilters));
    },
    [router],
  );

  const handlePageChange = useCallback(
    (nextPage: number) => {
      const nextFilters: FinanceHistoryFiltersUi = {
        ...filters,
        page: nextPage,
      };

      router.push(toFinanceHistoryUrl(nextFilters));
    },
    [filters, router],
  );

  useEffect(() => {
    if (areFiltersEqual(filters, urlFilters)) {
      return;
    }

    void applyFilters(urlFilters);
  }, [applyFilters, filters, urlFilters]);

  return (
    <div className='space-y-6'>
      <FinanceBackLink />

      <PageTitle
        title='Histórico'
        description='Consulte todas as movimentações financeiras registradas.'
      />

      <FinanceHistoryFilters
        key={`${filters.startDate}-${filters.endDate}-${filters.type ?? 'ALL'}-${filters.categoryId ?? 'ALL'}`}
        filters={filters}
        categories={initialCategories}
        isLoading={isLoading}
        onApplyFilters={handleApplyFilters}
      />

      {isLoading && (
        <div className='space-y-6'>
          <FinanceHistorySummarySkeleton />
          <ListRowsSkeleton count={5} />
        </div>
      )}

      {error && <LoadErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && (
        <>
          <FinanceHistorySummary
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            totalEntries={pagination.totalCount}
          />

          <FinanceHistoryList
            entries={entries}
            categories={initialCategories}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
