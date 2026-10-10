import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { IncomeGoalsOverviewUi, SpendingGoalsOverviewUi } from '../types/finance-ui.types';
import { IncomeGoalsSection } from './income-goals-section';
import { SpendingGoalsPageContent } from './spending-goals-page-content';

type GoalsPageContentProps = {
  incomeGoals?: IncomeGoalsOverviewUi | null;
  incomeGoalsError?: string | null;
  spendingGoals?: SpendingGoalsOverviewUi | null;
  spendingGoalsError?: string | null;
};

export function GoalsPageContent({
  incomeGoals,
  incomeGoalsError,
  spendingGoals,
  spendingGoalsError,
}: GoalsPageContentProps) {
  return (
    <div className='space-y-10'>
      <PageTitle
        title='Metas'
        description='Acompanhe seus alvos de ganho e os tetos de gasto do mês.'
      />
      <IncomeGoalsSection overview={incomeGoals} error={incomeGoalsError} />
      <SpendingGoalsPageContent overview={spendingGoals} error={spendingGoalsError} />
    </div>
  );
}
