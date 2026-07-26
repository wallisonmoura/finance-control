import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DebtsMonthFilter } from '@/modules/debts/presentation/ui/components/debts-month-filter';
import {
  getCurrentMonthValue,
  getPreviousMonthValue,
} from '@/modules/debts/presentation/ui/utils/debt-filters';

describe('DebtsMonthFilter', () => {
  it('deve renderizar o rótulo do mês formatado', () => {
    render(<DebtsMonthFilter month='2026-07' onMonthChange={jest.fn()} />);

    expect(screen.getByText('Julho de 2026')).toBeInTheDocument();
  });

  it('deve chamar onMonthChange com o mês anterior', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();

    render(<DebtsMonthFilter month='2026-07' onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: 'Mês anterior' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-06');
  });

  it('deve chamar onMonthChange com o próximo mês', async () => {
    const user = userEvent.setup();
    const onMonthChange = jest.fn();

    render(<DebtsMonthFilter month='2026-07' onMonthChange={onMonthChange} />);

    await user.click(screen.getByRole('button', { name: 'Próximo mês' }));

    expect(onMonthChange).toHaveBeenCalledWith('2026-08');
  });

  it('não deve mostrar o botão de reset quando já está no mês atual', () => {
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

  it('deve mostrar o botão de reset e voltar para o mês atual ao clicar', async () => {
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
