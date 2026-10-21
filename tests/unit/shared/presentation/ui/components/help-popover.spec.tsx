import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  HelpPopover,
  ScreenHelpBody,
} from '@/shared/presentation/ui/components/help-popover';
import { SCREEN_HELP } from '@/shared/presentation/ui/help/screen-help';

describe('HelpPopover', () => {
  it('should render a button named by the label and keep the content closed', () => {
    render(<HelpPopover label='Ajuda: Despesas'>Conteúdo</HelpPopover>);

    expect(screen.getByRole('button', { name: 'Ajuda: Despesas' })).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument();
  });

  it('should name the opened balloon after the label for screen readers', async () => {
    const user = userEvent.setup();
    render(<HelpPopover label='Ajuda: Despesas'>Conteúdo</HelpPopover>);

    await user.click(screen.getByRole('button', { name: 'Ajuda: Despesas' }));

    expect(await screen.findByRole('dialog', { name: 'Ajuda: Despesas' })).toBeInTheDocument();
  });

  it('should open with the keyboard and close on Escape, giving focus back to the button', async () => {
    const user = userEvent.setup();
    render(<HelpPopover label='Ajuda: Despesas'>Conteúdo</HelpPopover>);

    await user.tab();
    const button = screen.getByRole('button', { name: 'Ajuda: Despesas' });
    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(await screen.findByText('Conteúdo')).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Conteúdo')).not.toBeInTheDocument());
    expect(button).toHaveFocus();
  });
});

describe('ScreenHelpBody', () => {
  it('should show what the screen is and what can be done there', () => {
    render(<ScreenHelpBody help={SCREEN_HELP.expenses} />);

    expect(screen.getByText('O que é')).toBeInTheDocument();
    expect(screen.getByText(SCREEN_HELP.expenses.whatIs)).toBeInTheDocument();
    expect(screen.getByText('O que dá pra fazer aqui')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(SCREEN_HELP.expenses.actions.length);
  });

  it('should point expenses to debts for what will be paid later', () => {
    render(<ScreenHelpBody help={SCREEN_HELP.expenses} />);

    expect(screen.getByText('Não é aqui?')).toBeInTheDocument();
    expect(screen.getByText(/Vai pagar depois\?/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para Dívidas' })).toHaveAttribute(
      'href',
      '/debts',
    );
  });

  it('should leave out the elsewhere part when the screen has none', () => {
    render(<ScreenHelpBody help={SCREEN_HELP.history} />);

    expect(screen.queryByText('Não é aqui?')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('should not send incomes to the receivable balance', () => {
    expect(SCREEN_HELP.incomes.elsewhere).toBeUndefined();
  });
});
