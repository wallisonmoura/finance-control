import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { WalletPageContent } from '@/modules/wallet/presentation/ui/components/wallet-page-content';
import { useWallet } from '@/modules/wallet/presentation/ui/hooks/use-wallet';
import { WalletUi } from '@/modules/wallet/presentation/ui/types/wallet-ui.types';

jest.mock('@/modules/wallet/presentation/ui/hooks/use-wallet');
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}));

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

  it('deve renderizar erro quando não existir wallet carregada', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();

    mockUseWalletState({
      wallet: null,
      error: 'Wallet não encontrada.',
      refetch,
    });

    render(<WalletPageContent />);

    expect(screen.getByText('Wallet não encontrada.')).toBeInTheDocument();

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
      screen.getByText('Nenhuma Carteira encontrada para o usuário atual.'),
    ).toBeInTheDocument();
  });

  it('deve iniciar com o resumo e o formulário fechado', () => {
    mockUseWalletState();

    render(<WalletPageContent />);

    expect(
      screen.getByText(
        'Visualize sua posição financeira base e atualize seus saldos reais.',
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('region', {
        name: 'Resumo da Carteira',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Valor Total da Carteira')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    ).toBeInTheDocument();

    expect(screen.queryByLabelText('Saldo em Banco')).not.toBeInTheDocument();
    expect(screen.queryByText('Atualizar saldos-base')).not.toBeInTheDocument();
  });

  it('deve abrir o formulário ao clicar em Atualizar saldos', async () => {
    const user = userEvent.setup();

    mockUseWalletState();

    render(<WalletPageContent />);

    await user.click(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    );

    expect(screen.getByText('Atualizar saldos-base')).toBeInTheDocument();
    expect(screen.getByLabelText('Saldo em Banco')).toHaveValue('1500,00');
    expect(screen.getByLabelText('Saldo em Dinheiro')).toHaveValue('200,00');
    expect(screen.getByLabelText('Valores a Receber')).toHaveValue('450,00');
  });

  it('deve fechar o formulário ao clicar em Cancelar', async () => {
    const user = userEvent.setup();

    mockUseWalletState();

    render(<WalletPageContent />);

    await user.click(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    );

    expect(screen.getByLabelText('Saldo em Banco')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByLabelText('Saldo em Banco')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    ).toBeInTheDocument();
  });

  it('deve fechar o formulário quando a atualização for concluída com sucesso', async () => {
    const user = userEvent.setup();

    mockUseWalletState();

    const { rerender } = render(<WalletPageContent />);

    await user.click(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    );

    expect(screen.getByLabelText('Saldo em Banco')).toBeInTheDocument();

    mockUseWalletState({
      successMessage: 'Saldos da Carteira atualizados com sucesso.',
    });

    rerender(<WalletPageContent />);

    expect(screen.queryByLabelText('Saldo em Banco')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    ).toBeInTheDocument();
  });

  it('deve exibir toast de sucesso quando houver atualização concluída', () => {
    mockUseWalletState({
      successMessage: 'Saldos da Carteira atualizados com sucesso.',
    });

    render(<WalletPageContent />);

    expect(toast.success).toHaveBeenCalledWith(
      'Saldos da Carteira atualizados com sucesso.',
    );
  });

  it('deve renderizar erro com wallet carregada', () => {
    mockUseWalletState({
      error: 'Payload inválido.',
    });

    render(<WalletPageContent />);

    expect(screen.getByText('Payload inválido.')).toBeInTheDocument();

    expect(
      screen.getByRole('region', {
        name: 'Resumo da Carteira',
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

    await user.click(
      screen.getByRole('button', { name: 'Atualizar saldos' }),
    );

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

  it('deve inicializar o hook com os dados recebidos do servidor', () => {
    mockUseWalletState();

    render(<WalletPageContent initialWallet={wallet} initialError={null} />);

    expect(mockedUseWallet).toHaveBeenCalledWith({
      initialWallet: wallet,
      initialError: null,
    });
  });
});
