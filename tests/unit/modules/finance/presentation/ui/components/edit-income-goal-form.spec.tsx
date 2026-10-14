import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { EditIncomeGoalForm } from '@/modules/finance/presentation/ui/components/edit-income-goal-form';
import * as financeApiService from '@/modules/finance/presentation/ui/services/finance-api.service';
import { formatGoalLimitInput } from '@/modules/finance/presentation/ui/utils/parse-goal-limit';

jest.mock('@/modules/finance/presentation/ui/services/finance-api.service');
const setIncomeGoalsMock = jest.mocked(financeApiService.setIncomeGoals);

const targets = { revenueTarget: 6000, profitTarget: 2000 };

function renderForm(measure: 'revenue' | 'profit' = 'profit', onSaved = jest.fn()) {
  render(
    <EditIncomeGoalForm
      measure={measure}
      targets={targets}
      average={1450}
      averageLabel='Média por mês no período'
      onSaved={onSaved}
      onCancel={jest.fn()}
    />,
  );
  return onSaved;
}

describe('EditIncomeGoalForm', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should focus the field of the measure with its current value and the average', () => {
    renderForm('profit');
    const field = screen.getByLabelText('Lucro mensal');
    expect(field).toHaveFocus();
    expect(field).toHaveValue(formatGoalLimitInput(2000));
    expect(screen.getByText(/Média por mês no período/)).toBeInTheDocument();
  });

  it('should save the edited measure and keep the other one', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: 6000, profitTarget: 2500 } });
    const onSaved = renderForm('profit');

    await user.clear(screen.getByLabelText('Lucro mensal'));
    await user.type(screen.getByLabelText('Lucro mensal'), '2500');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(setIncomeGoalsMock).toHaveBeenCalledWith({ revenueTarget: 6000, profitTarget: 2500 });
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith({ revenueTarget: 6000, profitTarget: 2500 }));
  });

  it('should remove only this goal when the field is left empty', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ data: { revenueTarget: null, profitTarget: 2000 } });
    renderForm('revenue');

    await user.clear(screen.getByLabelText('Faturamento mensal'));
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(setIncomeGoalsMock).toHaveBeenCalledWith({ revenueTarget: null, profitTarget: 2000 });
  });

  it('should tie a validation error to the field and not call the API', async () => {
    const user = userEvent.setup();
    renderForm('profit');

    await user.clear(screen.getByLabelText('Lucro mensal'));
    await user.type(screen.getByLabelText('Lucro mensal'), '0');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    const field = screen.getByLabelText('Lucro mensal');
    const message = screen.getByText('Informe um valor maior que zero.');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAttribute('aria-describedby', message.id);
    expect(field).toHaveFocus();
    expect(setIncomeGoalsMock).not.toHaveBeenCalled();
  });

  it('should show the API error', async () => {
    const user = userEvent.setup();
    setIncomeGoalsMock.mockResolvedValue({ error: 'Não foi possível salvar.' });
    renderForm('profit');

    await user.click(screen.getByRole('button', { name: 'Salvar' }));

    expect(await screen.findByText('Não foi possível salvar.')).toBeInTheDocument();
  });
});
