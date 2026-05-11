import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WalletPageContent } from '@/modules/wallet/presentation/ui/components/wallet-page-content';
import { useWallet } from '@/modules/wallet/presentation/ui/hooks/use-wallet';
import { WalletUi } from '@/modules/wallet/presentation/ui/types/wallet-ui.types';

jest.mock('@/modules/wallet/presentation/ui/hooks/use-wallet');

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

const mockedUseWallet = jest.mocked(useWallet);

function mockUseWalletState(
  overrides: Partial<ReturnType<typeof useWallet>> = {},
) {
  mockedUseWallet.mockReturnValue({
    wallet,
    isLoading: false,
    isUpdating: false,
    error: null,
    successMessage: null,
    refetch: jest.fn(),
    updateBalances: jest.fn(),
    ...overrides,
  });
}

describe('WalletPageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o estado de loading', () => {
    mockUseWalletState({
      wallet: null,
      isLoading: true,
    });

    render(<WalletPageContent />);

    expect(screen.getByText('Wallet')).toBeInTheDocument();
    expect(
      screen.getByText('Visualize e atualize seus saldos-base.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Carregando Wallet...')).toBeInTheDocument();
  });

  it('deve renderizar erro quando não existir wallet carregada', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();

    mockUseWalletState({
      wallet: null,
      error: 'Wallet not found.',
      refetch,
    });

    render(<WalletPageContent />);

    expect(screen.getByText('Wallet not found.')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Tentar novamente',
      }),
    );

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar estado vazio quando não existir wallet nem erro', () => {
    mockUseWalletState({
      wallet: null,
      error: null,
    });

    render(<WalletPageContent />);

    expect(
      screen.getByText('Nenhuma Wallet encontrada para o usuário atual.'),
    ).toBeInTheDocument();
  });

  it('deve renderizar a Wallet com resumo e formulário', () => {
    mockUseWalletState();

    render(<WalletPageContent />);

    expect(
      screen.getByText(
        'Visualize sua posição financeira base e atualize seus saldos reais.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', {
        name: 'Resumo da Wallet',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Wallet Total')).toBeInTheDocument();
    expect(screen.getByText('Atualizar saldos-base')).toBeInTheDocument();

    expect(screen.getByLabelText('Saldo em Banco')).toHaveValue('1500');
    expect(screen.getByLabelText('Saldo em Dinheiro')).toHaveValue('200');
    expect(screen.getByLabelText('Valores a Receber')).toHaveValue('450');
  });

  it('deve renderizar mensagem de sucesso quando houver atualização concluída', () => {
    mockUseWalletState({
      successMessage: 'Saldos da Wallet atualizados com sucesso.',
    });

    render(<WalletPageContent />);

    expect(
      screen.getByText('Saldos da Wallet atualizados com sucesso.'),
    ).toBeInTheDocument();
  });

  it('deve renderizar erro com wallet carregada', () => {
    mockUseWalletState({
      error: 'Payload inválido.',
    });

    render(<WalletPageContent />);

    expect(screen.getByText('Payload inválido.')).toBeInTheDocument();

    expect(
      screen.getByRole('region', {
        name: 'Resumo da Wallet',
      }),
    ).toBeInTheDocument();
  });

  it('deve repassar updateBalances para o formulário', async () => {
    const user = userEvent.setup();
    const updateBalances = jest.fn().mockResolvedValue(undefined);

    mockUseWalletState({
      updateBalances,
    });

    render(<WalletPageContent />);

    await user.clear(screen.getByLabelText('Saldo em Banco'));
    await user.type(screen.getByLabelText('Saldo em Banco'), '2000');

    await user.clear(screen.getByLabelText('Saldo em Dinheiro'));
    await user.type(screen.getByLabelText('Saldo em Dinheiro'), '300');

    await user.clear(screen.getByLabelText('Valores a Receber'));
    await user.type(screen.getByLabelText('Valores a Receber'), '500');

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(updateBalances).toHaveBeenCalledWith({
      bankBalance: 2000,
      cashBalance: 300,
      receivableBalance: 500,
    });
  });
});
