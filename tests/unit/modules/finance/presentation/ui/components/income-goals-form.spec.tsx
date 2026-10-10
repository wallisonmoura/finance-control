import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { IncomeGoalsForm } from '@/modules/finance/presentation/ui/components/income-goals-form';
import { setIncomeGoals } from '@/modules/finance/presentation/ui/services/finance-api.service';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service', () => ({
  setIncomeGoals: jest.fn(),
}));

const setIncomeGoalsMock = jest.mocked(setIncomeGoals);

function renderForm(onSaved = jest.fn()) {
  render(
    <IncomeGoalsForm
      initial={{ revenueTarget: null, profitTarget: null }}
      averages={{ revenue: 4000, profit: null }}
      onSaved={onSaved}
      onCancel={jest.fn()}
    />,
  );

  return onSaved;
}

describe('IncomeGoalsForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should focus the first field when it opens', () => {
    renderForm();

    expect(screen.getByLabelText('Faturamento mensal')).toHaveFocus();
  });

  it('should show the average hint only where there is history', () => {
    renderForm();

    expect(screen.getByText(/Média dos últimos 3 meses/)).toHaveTextContent(/4\.000,00/);
    expect(screen.getAllByText(/Média dos últimos 3 meses/)).toHaveLength(1);
  });

  it('should save typed values with a decimal comma and empty fields as no goal', async () => {
    const user = userEvent.setup();
    const onSaved = renderForm();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000.5, profitTarget: null } });

    await user.type(screen.getByLabelText('Faturamento mensal'), '6000,50');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(setIncomeGoalsMock).toHaveBeenCalledWith({ revenueTarget: 6000.5, profitTarget: null });
  });

  it('should validate a field before calling the API', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Lucro mensal'), '1000000000000');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(
      screen.getByText('Lucro mensal: Informe um valor de até R$ 999.999.999.999,99.'),
    ).toBeInTheDocument();
    expect(setIncomeGoalsMock).not.toHaveBeenCalled();
  });

  it('should keep the form open with the API error', async () => {
    const user = userEvent.setup();
    const onSaved = renderForm();
    setIncomeGoalsMock.mockResolvedValue({ error: 'Erro ao salvar.' });

    await user.type(screen.getByLabelText('Faturamento mensal'), '6000');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Erro ao salvar.')).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
