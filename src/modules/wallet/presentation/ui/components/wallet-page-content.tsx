'use client';

import { useEffect } from 'react';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Button } from '@/shared/presentation/ui/components/button';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadingState } from '@/shared/presentation/ui/components/loading-state';

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

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Wallet'
          description='Visualize e atualize seus saldos-base.'
        />

        <LoadingState message='Carregando Wallet...' />
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
              <RotateCw aria-hidden='true' className='size-4' />
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

        <EmptyState description='Nenhuma Wallet encontrada para o usuário atual.' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Wallet'
        description='Visualize sua posição financeira base e atualize seus saldos reais.'
      />

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
