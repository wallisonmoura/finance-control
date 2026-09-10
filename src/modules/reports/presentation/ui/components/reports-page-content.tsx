'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  REPORTS_PERIOD_MONTH_OPTIONS,
  ReportsPeriodMonths,
} from '../utils/reports-period';
import { CategoryExpensesChart } from './category-expenses-chart';
import { DebtsPaidChart } from './debts-paid-chart';
import { IncomeExpenseEvolutionChart } from './income-expense-evolution-chart';

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

        <div className='w-full max-w-48'>
          <SelectField
            id='reports-period-months'
            name='months'
            label='Período'
            value={String(months)}
            onChange={(event) =>
              handleMonthsChange(
                Number(event.target.value) as ReportsPeriodMonths,
              )
            }
            // Unlike Tipo/Categoria elsewhere, Período never has a
            // legitimate empty state — it always defaults to 6 and must
            // stay one of 3/6/12. Passing `children` opts out of
            // SelectField's default placeholder option (which would
            // otherwise be selectable and send an invalid `months=0` to
            // every chart's request). `options` stays required by the
            // component's props but is unused whenever `children` is set.
            options={[]}
          >
            {REPORTS_PERIOD_MONTH_OPTIONS.map((option) => (
              <option key={option} value={String(option)}>
                {option} meses
              </option>
            ))}
          </SelectField>
        </div>
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
