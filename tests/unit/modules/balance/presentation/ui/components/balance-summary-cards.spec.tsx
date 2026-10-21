import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TERM_HELP } from '@/shared/presentation/ui/help/screen-help';
import { BalanceSummaryCards } from '@/modules/balance/presentation/ui/components/balance-summary-cards';

describe('BalanceSummaryCards', () => {
  const summary = {
    wallet: {
      bankBalance: 1500,
      cashBalance: 200,
      receivableBalance: 450,
      walletTotal: 2150,
    },
    debts: {
      pendingDebts: 300,
    },
    finalBalance: 1850,
  };
  it('should render the insights slot between balance composition and recent transactions', () => {
    render(
      <BalanceSummaryCards
        summary={summary}
        insightsSlot={<div data-testid='insights-slot' />}
      />,
    );

    const composition = screen.getByRole('heading', { name: 'Composição dos saldos' });
    const slot = screen.getByTestId('insights-slot');
    const recent = screen.getByRole('heading', { name: 'Transações recentes' });

    expect(
      composition.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      slot.compareDocumentPosition(recent) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('should render the goals slot after balance composition and before the insights', () => {
    render(
      <BalanceSummaryCards
        summary={summary}
        goalsSlot={<div data-testid='goals-slot' />}
        insightsSlot={<div data-testid='insights-slot' />}
      />,
    );

    const composition = screen.getByRole('heading', { name: 'Composição dos saldos' });
    const slot = screen.getByTestId('goals-slot');
    const insights = screen.getByTestId('insights-slot');

    expect(
      composition.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      slot.compareDocumentPosition(insights) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it.each([
    ['Saldo Final', TERM_HELP.finalBalance.text],
    ['Valor Total da Carteira', TERM_HELP.walletTotal.text],
    ['Dívidas Pendentes', TERM_HELP.pendingDebts.text],
  ])('should explain %s from a help button', async (term, text) => {
    const user = userEvent.setup();
    render(<BalanceSummaryCards summary={summary} />);

    await user.click(screen.getByRole('button', { name: `O que é ${term}?` }));

    expect(await screen.findByText(text)).toBeInTheDocument();
  });

  it('should render all summary card labels', () => {
    render(<BalanceSummaryCards summary={summary} />);

    expect(screen.getByText('Valor Total da Carteira')).toBeInTheDocument();
    expect(screen.getByText('Dívidas Pendentes')).toBeInTheDocument();
    expect(screen.getByText('Saldo Final')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Banco')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Dinheiro')).toBeInTheDocument();
    expect(screen.getByText('Valores a Receber')).toBeInTheDocument();
  });

  it('should render all card descriptions', () => {
    render(<BalanceSummaryCards summary={summary} />);

    expect(
      screen.getByText('Resultado após considerar dívidas pendentes.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valor disponível em conta bancária.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valor disponível em dinheiro físico.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valores previstos para recebimento.'),
    ).toBeInTheDocument();
  });

  it('should render formatted money values', () => {
    render(<BalanceSummaryCards summary={summary} />);

    expect(screen.getByText('R$ 2.150,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.850,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 1.500,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 200,00')).toBeInTheDocument();
    expect(screen.getByText('R$ 450,00')).toBeInTheDocument();
  });

  it('should render the summary section with accessible label', () => {
    render(<BalanceSummaryCards summary={summary} />);

    expect(
      screen.getByRole('region', { name: 'Resumo financeiro' }),
    ).toBeInTheDocument();
  });
});
