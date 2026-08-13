import type { Metadata } from 'next';
import {
  getCurrentUserExpenseCategories,
  getCurrentUserFinanceHistory,
} from '@/modules/finance/presentation/server/get-current-user-finance-data';
import { FinanceExpensesPageContent } from '@/modules/finance/presentation/ui/components/finance-expenses-page-content';
import { getCurrentMonthFilters } from '@/modules/finance/presentation/ui/utils/finance-filters';

export const metadata: Metadata = {
  title: 'Despesas',
};

export default async function FinanceExpensesPage() {
  const filters = getCurrentMonthFilters({
    type: 'EXPENSE',
  });
  const [history, categories] = await Promise.all([
    getCurrentUserFinanceHistory(filters),
    getCurrentUserExpenseCategories(),
  ]);

  return (
    <FinanceExpensesPageContent
      initialHistory={history.data}
      initialHistoryError={history.error}
      initialFilters={filters}
      initialCategories={categories.data}
      initialCategoriesError={categories.error}
    />
  );
}
