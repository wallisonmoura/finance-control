'use client';

import { useEffect, useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';

import { PageTitle } from '@/shared/presentation/ui/components/page-title';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Button } from '@/shared/presentation/ui/components/button';
import { EmptyState } from '@/shared/presentation/ui/components/empty-state';
import { LoadErrorState } from '@/shared/presentation/ui/components/load-error-state';

import { useWallet } from '../hooks/use-wallet';
import { WalletUi } from '../types/wallet-ui.types';
import { WalletSummaryCard } from './wallet-summary-card';
import { WalletBalancesForm } from './wallet-balances-form';

type WalletPageContentProps = {
  initialWallet?: WalletUi | null;
  initialError?: string | null;
};

export function WalletPageContent({
  initialWallet = null,
  initialError = null,
}: WalletPageContentProps) {
  const { wallet, isUpdating, error, successMessage, refetch, updateBalances } =
    useWallet({ initialWallet, initialError });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [lastHandledSuccess, setLastHandledSuccess] = useState(successMessage);

  // Fecha o formulário quando uma atualização é concluída com sucesso.
  // Ajuste feito durante o render (não em effect) para evitar renders em cascata.
  if (successMessage !== lastHandledSuccess) {
    setLastHandledSuccess(successMessage);

    if (successMessage) {
      setIsFormOpen(false);
    }
  }

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
    }
  }, [successMessage]);

  if (error && !wallet) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Carteira'
          description='Visualize e atualize seus saldos-base.'
        />

        <LoadErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className='space-y-6'>
        <PageTitle
          title='Carteira'
          description='Visualize e atualize seus saldos-base.'
        />

        <EmptyState description='Nenhuma Carteira encontrada para o usuário atual.' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <PageTitle
        title='Carteira'
        description='Visualize sua posição financeira base e atualize seus saldos reais.'
      />

      {error ? <FormErrorMessage message={error} /> : null}

      <WalletSummaryCard wallet={wallet} />

      {isFormOpen ? (
        <WalletBalancesForm
          wallet={wallet}
          isUpdating={isUpdating}
          onSubmit={updateBalances}
          onCancel={() => setIsFormOpen(false)}
        />
      ) : (
        <Button
          type='button'
          onClick={() => setIsFormOpen(true)}
          variant='custom'
          className='h-12 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto'
        >
          <Pencil aria-hidden='true' className='size-4' />
          Atualizar saldos
        </Button>
      )}
    </div>
  );
}
