'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import {
  getCurrentMonthFilters,
  useFinanceHistory,
} from '../hooks/use-finance-history';
import { FinanceHistoryFilters } from './finance-history-filters';
import { FinanceHistoryList } from './finance-history-list';
import { FinanceHistorySummary } from './finance-history-summary';
import {
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';
import { FinanceBackLink } from './finance-back-link';

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDateOnly(value: string | null): value is string {
  if (!value || !DATE_ONLY_REGEX.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidType(value: string | null): value is FinanceEntryTypeUi {
  return value === 'INCOME' || value === 'EXPENSE';
}

function getFiltersFromSearchParams(
  searchParams: URLSearchParams,
): FinanceHistoryFiltersUi {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type');

  return getCurrentMonthFilters({
    ...(isValidDateOnly(startDate) ? { startDate } : {}),
    ...(isValidDateOnly(endDate) ? { endDate } : {}),
    ...(isValidType(type) ? { type } : {}),
  });
}

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

export function FinanceHistoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlFilters = useMemo(
    () => getFiltersFromSearchParams(searchParams),
    [searchParams],
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
  } = useFinanceHistory(urlFilters);

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
        title='Histórico financeiro'
        description='Consulte receitas e despesas realizadas por período.'
      />

      <FinanceHistoryFilters
        key={`${filters.startDate}-${filters.endDate}-${filters.type ?? 'ALL'}`}
        filters={filters}
        isLoading={isLoading}
        onApplyFilters={handleApplyFilters}
      />

      {isLoading && (
        <p className='text-sm text-slate-500'>
          Carregando histórico financeiro...
        </p>
      )}

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!isLoading && !error && (
        <>
          <FinanceHistorySummary
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            balance={balance}
          />

          <FinanceHistoryList entries={entries} />
        </>
      )}
    </div>
  );
}
