import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtActionsBar } from '@/modules/debts/presentation/ui/components/debt-actions-bar';

describe('DebtActionsBar', () => {
  it('should render navigation shortcuts', () => {
    render(<DebtActionsBar onCreateDebt={jest.fn()} />);

    expect(
      screen.getByRole('link', { name: 'Ver pendentes' }),
    ).toHaveAttribute('href', '/debts/pending');
    expect(screen.getByRole('link', { name: 'Ver pagas' })).toHaveAttribute(
      'href',
      '/debts/paid',
    );
    expect(
      screen.getByRole('button', { name: 'Nova dívida' }),
    ).toBeInTheDocument();
  });

  it('should call create action', async () => {
    const user = userEvent.setup();
    const onCreateDebt = jest.fn();

    render(<DebtActionsBar onCreateDebt={onCreateDebt} />);

    await user.click(screen.getByRole('button', { name: 'Nova dívida' }));

    expect(onCreateDebt).toHaveBeenCalledTimes(1);
  });
});
