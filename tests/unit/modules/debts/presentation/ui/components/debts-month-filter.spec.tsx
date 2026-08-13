import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtsMonthFilter } from '@/modules/debts/presentation/ui/components/debts-month-filter';
import {
  getCurrentMonthValue,
  getPreviousMonthValue,
} from '@/modules/debts/presentation/ui/utils/debt-filters';

describe('DebtsMonthFilter', () => {
  it('should render the formatted month label', () => {
    render(<DebtsMonthFilter month='2026-07' onMonthChange={jest.fn()} />);

    expect(screen.getByText('Julho de 2026')).toBeInTheDocument();
  });

  it('should call onMonthChange with the previous month', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();

    render(<DebtsMonthFilter month='2026-07' onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-06');
  });

  it('should call onMonthChange with the next month', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();

    render(<DebtsMonthFilter month='2026-07' onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-08');
  });

  it('should not show the reset button when already on the current month', () => {
    render(
      <DebtsMonthFilter
        month={getCurrentMonthValue()}
        onMonthChange={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Mês atual' }),
    ).not.toBeInTheDocument();
  });

  it('should show the reset button and go back to the current month on click', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();
    const notCurrentMonth = getPreviousMonthValue(getCurrentMonthValue());

    render(
      <DebtsMonthFilter month={notCurrentMonth} onMonthChange={onMonthChange} />,
    );

    await user.click(screen.getByRole('button', { name: 'Mês atual' }));

    expect(onMonthChange).toHaveBeenCalledWith(getCurrentMonthValue());
  });
});
