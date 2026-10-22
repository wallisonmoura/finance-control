import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  HelpPopover,
  ScreenHelpBody,
  TermHelp,
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

  it('should describe the balloon with its content for screen readers', async () => {
    const user = userEvent.setup();
    render(<HelpPopover label='Ajuda: Despesas'>Conteúdo da ajuda</HelpPopover>);

    await user.click(screen.getByRole('button', { name: 'Ajuda: Despesas' }));

    expect(await screen.findByRole('dialog')).toHaveAccessibleDescription('Conteúdo da ajuda');
  });

  it('should close and give focus back to the button when tabbing past the last link', async () => {
    const user = userEvent.setup();
    render(
      <>
        <HelpPopover label='Ajuda: Despesas'>
          <ScreenHelpBody help={SCREEN_HELP.expenses} />
        </HelpPopover>
        <button type='button'>Depois</button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Ajuda: Despesas' });
    await user.click(trigger);
    const link = await screen.findByRole('link', { name: 'Ir para Dívidas' });
    link.focus();

    await user.tab();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('should close and give focus back to the button when tabbing in a balloon without links', async () => {
    const user = userEvent.setup();
    render(<HelpPopover label='Ajuda: Histórico'>Só texto</HelpPopover>);

    const trigger = screen.getByRole('button', { name: 'Ajuda: Histórico' });
    await user.click(trigger);
    await screen.findByRole('dialog');

    await user.tab();

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('should use a solid focus ring, and the brand green on the hero', () => {
    render(
      <>
        <HelpPopover label='Normal'>x</HelpPopover>
        <HelpPopover label='Hero' tone='hero'>
          y
        </HelpPopover>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Normal' })).toHaveClass('focus-visible:ring-ring');
    expect(screen.getByRole('button', { name: 'Hero' })).toHaveClass(
      'focus-visible:ring-hero-accent',
    );
  });

  it('should give the hero figures the brand green focus ring', () => {
    render(<TermHelp term='finalBalance' />);

    expect(screen.getByRole('button', { name: 'O que é Saldo Final?' })).toHaveClass(
      'focus-visible:ring-hero-accent',
    );
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

  it('should show the note when the screen has one', () => {
    render(<ScreenHelpBody help={SCREEN_HELP.incomes} />);

    expect(screen.getByText('Isso não altera os saldos da Carteira.')).toBeInTheDocument();
  });
});

describe('screen help texts', () => {
  it('should tell that registering income or expense does not change the Carteira', () => {
    expect(SCREEN_HELP.wallet.elsewhere?.text).toMatch(/não muda os saldos daqui/);
    expect(SCREEN_HELP.incomes.note).toBe('Isso não altera os saldos da Carteira.');
    expect(SCREEN_HELP.expenses.note).toBe('Isso não altera os saldos da Carteira.');
  });

  it('should tell where to undo a payment made by mistake', () => {
    expect(SCREEN_HELP.pendingDebts.note).toBe(
      'Pagou a errada? Dá pra desfazer em até 24h, em Dívidas pagas.',
    );
  });

  it('should not promise editing the expenses that came from a paid debt', () => {
    expect(SCREEN_HELP.expenses.actions).toContain(
      'Editar ou excluir uma despesa (exceto as que vieram do pagamento de uma dívida)',
    );
  });
});
