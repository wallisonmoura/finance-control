'use client';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { useFinanceHistory } from '../hooks/use-finance-history';
import { FinanceHistoryFilters } from './finance-history-filters';
import { FinanceHistoryList } from './finance-history-list';
import { FinanceHistorySummary } from './finance-history-summary';

export function FinanceHistoryPageContent() {
  const {
    entries,
    totalIncome,
    totalExpense,
    balance,
    filters,
    isLoading,
    error,
    applyFilters,
  } = useFinanceHistory();

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Histórico financeiro'
        description='Consulte receitas e despesas realizadas por período.'
      />

      <FinanceHistoryFilters
        filters={filters}
        isLoading={isLoading}
        onApplyFilters={applyFilters}
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
