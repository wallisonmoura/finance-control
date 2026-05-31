import { render, screen } from '@testing-library/react';

import { WalletSummaryCard } from '@/modules/wallet/presentation/ui/components/wallet-summary-card';
import { WalletUi } from '@/modules/wallet/presentation/ui/types/wallet-ui.types';

const wallet: WalletUi = {
  id: 'wallet-id',
  userId: 'user-id',
  bankBalance: 1500,
  cashBalance: 200,
  receivableBalance: 450,
  createdAt: '2026-05-06T03:53:23.214Z',
  updatedAt: '2026-05-06T05:12:28.557Z',
  walletTotal: 2150,
};

describe('WalletSummaryCard', () => {
  it('deve renderizar a região de resumo da Wallet', () => {
    render(<WalletSummaryCard wallet={wallet} />);

    expect(
      screen.getByRole('region', {
        name: 'Resumo da Carteira',
      }),
    ).toBeInTheDocument();
  });

  it('deve renderizar os labels dos saldos da Wallet', () => {
    render(<WalletSummaryCard wallet={wallet} />);

    expect(screen.getByText('Valor Total da Carteira')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Banco')).toBeInTheDocument();
    expect(screen.getByText('Saldo em Dinheiro')).toBeInTheDocument();
    expect(screen.getByText('Valores a Receber')).toBeInTheDocument();
  });

  it('deve renderizar as descrições dos cards', () => {
    render(<WalletSummaryCard wallet={wallet} />);

    expect(
      screen.getByText('Soma dos saldos-base informados na carteira.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valor disponível em conta bancária.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valor disponível em espécie.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Valores previstos para recebimento.'),
    ).toBeInTheDocument();
  });

  it('deve renderizar os valores monetários formatados', () => {
    render(<WalletSummaryCard wallet={wallet} />);

    expect(screen.getByText(/2.150,00/)).toBeInTheDocument();
    expect(screen.getByText(/1.500,00/)).toBeInTheDocument();
    expect(screen.getByText(/200,00/)).toBeInTheDocument();
    expect(screen.getByText(/450,00/)).toBeInTheDocument();
  });
});
