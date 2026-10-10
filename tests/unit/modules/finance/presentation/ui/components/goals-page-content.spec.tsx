import { render, screen } from '@testing-library/react';

import { GoalsPageContent } from '@/modules/finance/presentation/ui/components/goals-page-content';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: jest.fn() }),
}));
jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setIncomeGoals: jest.fn(),
  setCategoryMonthlyLimit: jest.fn(),
}));

describe('GoalsPageContent', () => {
  it('should title the page and show income goals before spending goals', () => {
    render(
      <GoalsPageContent
        incomeGoals={{ revenue: null, profit: null, averages: { revenue: null, profit: null } }}
        spendingGoals={{ goals: [], availableCategories: [], averageByCategoryId: {} }}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Metas' })).toBeInTheDocument();
    const income = screen.getByRole('heading', { level: 2, name: 'Metas de ganho' });
    const spending = screen.getByRole('heading', { level: 2, name: 'Metas de gasto' });
    expect(income.compareDocumentPosition(spending) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
