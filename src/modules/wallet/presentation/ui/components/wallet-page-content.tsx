'use client';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Button } from '@/shared/presentation/ui/components/button';

import { useWallet } from '../hooks/use-wallet';
import { WalletSummaryCard } from './wallet-summary-card';
import { WalletBalancesForm } from './wallet-balances-form';

export function WalletPageContent() {
  const {
    wallet,
    isLoading,
    isUpdating,
    error,
    successMessage,
    refetch,
    updateBalances,
  } = useWallet();

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Wallet'
          description='Visualize e atualize seus saldos-base.'
        />

        <Card>
          <p className='text-sm text-zinc-500'>Carregando Wallet...</p>
        </Card>
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Wallet'
          description='Visualize e atualize seus saldos-base.'
        />

        <Card>
          <div className='space-y-4'>
            <FormErrorMessage message={error} />

            <Button type='button' onClick={refetch}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Wallet'
          description='Visualize e atualize seus saldos-base.'
        />

        <Card>
          <p className='text-sm text-zinc-500'>
            Nenhuma Wallet encontrada para o usuário atual.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Wallet'
        description='Visualize sua posição financeira base e atualize seus saldos reais.'
      />

      {successMessage ? (
        <Card>
          <p className='text-sm font-medium text-emerald-700'>
            {successMessage}
          </p>
        </Card>
      ) : null}

      {error ? <FormErrorMessage message={error} /> : null}

      <WalletSummaryCard wallet={wallet} />

      <WalletBalancesForm
        wallet={wallet}
        isUpdating={isUpdating}
        onSubmit={updateBalances}
      />
    </div>
  );
}
