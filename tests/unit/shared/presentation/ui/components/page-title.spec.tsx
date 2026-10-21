import { render, screen } from '@testing-library/react';

import userEvent from '@testing-library/user-event';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { SCREEN_HELP } from '@/shared/presentation/ui/help/screen-help';

describe('PageTitle', () => {
  it('should render the title', () => {
    render(<PageTitle title='Dashboard' />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it('should render the description when given', () => {
    render(<PageTitle title='Dashboard' description='Resumo financeiro.' />);

    expect(screen.getByText('Resumo financeiro.')).toBeInTheDocument();
  });

  it('should let a long title wrap instead of overflowing next to the help button', () => {
    render(<PageTitle title='Supercalifragilisticexpialidocious' help={SCREEN_HELP.history} />);

    expect(screen.getByRole('heading')).toHaveClass('min-w-0', 'break-words');
  });

  it('should not render a help button without help', () => {
    render(<PageTitle title='Conta' />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render a help button named after the title when given help', async () => {
    const user = userEvent.setup();
    render(<PageTitle title='Despesas' help={SCREEN_HELP.expenses} />);

    await user.click(screen.getByRole('button', { name: 'Ajuda: Despesas' }));

    expect(await screen.findByText(SCREEN_HELP.expenses.whatIs)).toBeInTheDocument();
  });
});
