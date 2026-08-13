import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { FinanceHistoryFilters } from '@/modules/finance/presentation/ui/components/finance-history-filters';
import { ExpenseCategoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';

const categories: ExpenseCategoryUi[] = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Combustível', slug: 'combustivel' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Alimentação', slug: 'alimentacao' },
];

const baseFilters = {
  startDate: '2026-04-01',
  endDate: '2026-04-30',
};

it('keeps the category select disabled when the type is not Expenses', () => {
  render(
    <FinanceHistoryFilters
      filters={baseFilters}
      categories={categories}
      onApplyFilters={jest.fn()}
    />,
  );

  expect(screen.getByLabelText('Categoria')).toBeDisabled();
});

it('enables the category when choosing Expenses and emits categoryId on apply', async () => {
  const user = userEvent.setup();
  const onApplyFilters = jest.fn();

  render(
    <FinanceHistoryFilters
      filters={baseFilters}
      categories={categories}
      onApplyFilters={onApplyFilters}
    />,
  );

  await user.selectOptions(screen.getByLabelText('Tipo'), 'EXPENSE');
  expect(screen.getByLabelText('Categoria')).toBeEnabled();

  await user.selectOptions(
    screen.getByLabelText('Categoria'),
    '11111111-1111-4111-8111-111111111111',
  );
  await user.click(screen.getByRole('button', { name: /Aplicar filtros/ }));

  expect(onApplyFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      type: 'EXPENSE',
      categoryId: '11111111-1111-4111-8111-111111111111',
    }),
  );
});

it('clears the category when changing the type away from Expenses', async () => {
  const user = userEvent.setup();
  const onApplyFilters = jest.fn();

  render(
    <FinanceHistoryFilters
      filters={baseFilters}
      categories={categories}
      onApplyFilters={onApplyFilters}
    />,
  );

  await user.selectOptions(screen.getByLabelText('Tipo'), 'EXPENSE');
  await user.selectOptions(
    screen.getByLabelText('Categoria'),
    '11111111-1111-4111-8111-111111111111',
  );
  await user.selectOptions(screen.getByLabelText('Tipo'), 'ALL');
  await user.click(screen.getByRole('button', { name: /Aplicar filtros/ }));

  expect(onApplyFilters).toHaveBeenCalledWith(
    expect.not.objectContaining({ categoryId: expect.anything() }),
  );
});
