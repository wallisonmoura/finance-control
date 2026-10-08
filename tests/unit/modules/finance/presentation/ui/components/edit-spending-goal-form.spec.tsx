import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditSpendingGoalForm } from '@/modules/finance/presentation/ui/components/edit-spending-goal-form';
import { setCategoryMonthlyLimit } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setCategoryMonthlyLimit: jest.fn(),
}));

const setCategoryMonthlyLimitMock = jest.mocked(setCategoryMonthlyLimit);

describe('EditSpendingGoalForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should start empty and define the limit of a category without a goal', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();
    setCategoryMonthlyLimitMock.mockResolvedValue({
      data: { id: 'cat-2', name: 'Lazer', slug: 'lazer', monthlyLimit: 250 },
    });

    render(
      <EditSpendingGoalForm
        categoryId='cat-2'
        categoryName='Lazer'
        initialLimit={null}
        average={180}
        onSaved={onSaved}
        onCancel={jest.fn()}
      />,
    );

    const input = screen.getByLabelText('Limite mensal de Lazer');
    expect(input).toHaveValue('');
    expect(screen.getByText(/média dos últimos 3 meses/i)).toHaveTextContent(/180,00/);

    await user.type(input, '250');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(250));
    expect(setCategoryMonthlyLimitMock).toHaveBeenCalledWith('cat-2', 250);
  });

  it('should prefill the current limit when editing', () => {
    render(
      <EditSpendingGoalForm
        categoryId='cat-1'
        categoryName='Combustível'
        initialLimit={1500.5}
        average={null}
        onSaved={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Novo limite de Combustível')).toHaveValue('1500,5');
    expect(screen.queryByText(/média dos últimos 3 meses/i)).not.toBeInTheDocument();
  });

  it('should keep the form open and not call onSaved when the API fails', async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();
    setCategoryMonthlyLimitMock.mockResolvedValue({ error: 'Categoria de despesa não encontrada.' });

    render(
      <EditSpendingGoalForm
        categoryId='cat-1'
        categoryName='Combustível'
        initialLimit={1500}
        average={null}
        onSaved={onSaved}
        onCancel={jest.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Categoria de despesa não encontrada.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
