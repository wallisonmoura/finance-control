import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { WalletBalancesForm } from '@/modules/wallet/presentation/ui/components/wallet-balances-form';
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

describe('WalletBalancesForm', () => {
  it('deve renderizar os campos com os valores atuais da Wallet', () => {
    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Saldo em Banco')).toHaveValue('1500,00');
    expect(screen.getByLabelText('Saldo em Dinheiro')).toHaveValue('200,00');
    expect(screen.getByLabelText('Valores a Receber')).toHaveValue('450,00');
  });

  it('deve enviar os novos saldos-base ao submeter o formulário', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
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

    expect(onSubmit).toHaveBeenCalledWith({
      bankBalance: 2000,
      cashBalance: 300,
      receivableBalance: 500,
    });
  });

  it('deve aceitar valores decimais com vírgula', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('Saldo em Banco'));
    await user.type(screen.getByLabelText('Saldo em Banco'), '1500,50');

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      bankBalance: 1500.5,
      cashBalance: 200,
      receivableBalance: 450,
    });
  });

  it('deve exibir erro quando algum valor estiver vazio', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('Saldo em Banco'));

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(
      screen.getByText('Informe valores válidos maiores ou iguais a zero.'),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('deve exibir erro quando algum valor for negativo', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('Saldo em Banco'));
    await user.type(screen.getByLabelText('Saldo em Banco'), '-1');

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(
      screen.getByText('Informe valores válidos maiores ou iguais a zero.'),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should reject an amount above the allowed ceiling', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('Saldo em Banco'));
    await user.type(
      screen.getByLabelText('Saldo em Banco'),
      '1000000000000',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(
      screen.getByText('Informe valores válidos maiores ou iguais a zero.'),
    ).toBeInTheDocument();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should accept an amount at the allowed ceiling', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn().mockResolvedValue(undefined);

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={onSubmit}
        onCancel={jest.fn()}
      />,
    );

    await user.clear(screen.getByLabelText('Saldo em Banco'));
    await user.type(
      screen.getByLabelText('Saldo em Banco'),
      '999999999999,99',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Salvar saldos',
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ bankBalance: 999999999999.99 }),
    );
  });

  it('deve chamar onCancel ao clicar em Cancelar', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating={false}
        onSubmit={jest.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('deve desabilitar o botão enquanto estiver atualizando', () => {
    render(
      <WalletBalancesForm
        wallet={wallet}
        isUpdating
        onSubmit={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Salvando...',
      }),
    ).toBeDisabled();
  });
});
