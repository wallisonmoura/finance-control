'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import {
  getFinanceHistoryFiltersFromUrlSearchParams,
} from '../utils/finance-filters';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { FinanceHistoryFilters } from './finance-history-filters';
import { FinanceHistoryList } from './finance-history-list';
import { FinanceHistorySummary } from './finance-history-summary';
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

  return `/finance/history?${searchParams.toString()}`;
}

function areFiltersEqual(
  first: FinanceHistoryFiltersUi,
  second: FinanceHistoryFiltersUi,
): boolean {
  return (
    first.startDate === second.startDate &&
    first.endDate === second.endDate &&
    first.type === second.type
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
    filters,
    isLoading,
    error,
    applyFilters,
  } = useFinanceHistory(hookInitialParams);

  const handleApplyFilters = useCallback(
    async (nextFilters: FinanceHistoryFiltersUi) => {
      router.push(toFinanceHistoryUrl(nextFilters));
      await applyFilters(nextFilters);
    },
    [applyFilters, router],
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
        key={`${filters.startDate}-${filters.endDate}-${filters.type ?? 'ALL'}`}
        filters={filters}
        isLoading={isLoading}
        onApplyFilters={handleApplyFilters}
      />

      {isLoading && (
        <p className='text-sm text-muted-foreground'>
          Carregando histórico financeiro...
        </p>
      )}

      {error && <FormErrorMessage message={error} />}

      {!isLoading && !error && (
        <>
          <FinanceHistorySummary
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
            totalEntries={entries.length}
          />

          <FinanceHistoryList entries={entries} categories={initialCategories} />
        </>
      )}
    </div>
  );
}
