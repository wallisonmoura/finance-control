'use client';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { useFinanceHistory } from '../hooks/use-finance-history';
import { IncomeForm } from './income-form';
import { FinanceHistoryList } from './finance-history-list';
import { FinanceHistorySummary } from './finance-history-summary';

function getCurrentMonthFilters() {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const startDate = new Date(year, month, 1).toISOString().slice(0, 10);
  const endDate = new Date(year, month + 1, 0).toISOString().slice(0, 10);

  return {
    startDate,
    endDate,
  };
}

export function FinancePageContent() {
  const {
    entries,
    totalIncome,
    totalExpense,
    balance,
    isLoading,
    error,
    refresh,
  } = useFinanceHistory(getCurrentMonthFilters());

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Financeiro'
        description='Registre receitas e acompanhe o histórico operacional.'
      />

      <IncomeForm onIncomeCreated={refresh} />

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
