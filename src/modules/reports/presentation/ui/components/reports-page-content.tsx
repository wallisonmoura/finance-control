'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { ReportsPeriodMonths } from '../utils/reports-period';
import { CategoryExpensesChart } from './category-expenses-chart';
import { DebtsPaidChart } from './debts-paid-chart';
import { IncomeExpenseEvolutionChart } from './income-expense-evolution-chart';
import { ReportsPeriodSelect } from './reports-period-select';

type ReportsPageContentProps = {
  initialMonths: ReportsPeriodMonths;
};

export function ReportsPageContent({ initialMonths }: ReportsPageContentProps) {
  const router = useRouter();
  const [months, setMonths] = useState<ReportsPeriodMonths>(initialMonths);

  const handleMonthsChange = useCallback(
    (nextMonths: ReportsPeriodMonths) => {
      setMonths(nextMonths);
      router.push(`/relatorios?months=${nextMonths}`, { scroll: false });
    },
    [router],
  );

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <PageTitle
          title='Relatórios'
          description='Visualize o comportamento financeiro ao longo do tempo.'
        />

        <ReportsPeriodSelect
          id='reports-period-months'
          value={months}
          onChange={handleMonthsChange}
        />
      </div>

      <div className='grid gap-6 xl:grid-cols-2'>
        <div className='xl:col-span-2'>
          <IncomeExpenseEvolutionChart months={months} />
        </div>

        <CategoryExpensesChart months={months} />
        <DebtsPaidChart months={months} />
      </div>
    </div>
  );
}
