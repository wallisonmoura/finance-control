'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import {
  UpdateWalletBalancesPayload,
  WalletUi,
} from '../types/wallet-ui.types';

type WalletBalancesFormProps = {
  wallet: WalletUi;
  isUpdating: boolean;
  onSubmit: (payload: UpdateWalletBalancesPayload) => Promise<void>;
};

type WalletBalancesFormState = {
  bankBalance: string;
  cashBalance: string;
  receivableBalance: string;
};

const INVALID_AMOUNT_MESSAGE =
  'Informe valores válidos maiores ou iguais a zero.';

function toFormState(wallet: WalletUi): WalletBalancesFormState {
  return {
    bankBalance: String(wallet.bankBalance).replace('.', ','),
    cashBalance: String(wallet.cashBalance).replace('.', ','),
    receivableBalance: String(wallet.receivableBalance).replace('.', ','),
  };
}

function parseAmount(value: string) {
  return Number(value.replace(',', '.'));
}

function isValidAmount(value: string) {
  if (!value.trim()) {
    return false;
  }

  if (!/^\d+(,\d{1,2})?$/.test(value)) {
    return false;
  }

  const amount = parseAmount(value);

  return Number.isFinite(amount) && amount >= 0;
}

const amountSchema = z.string().refine(isValidAmount, {
  message: INVALID_AMOUNT_MESSAGE,
});

const walletBalancesFormSchema = z.object({
  bankBalance: amountSchema,
  cashBalance: amountSchema,
  receivableBalance: amountSchema,
});

type WalletBalancesFormValues = z.infer<typeof walletBalancesFormSchema>;

export function WalletBalancesForm({
  wallet,
  isUpdating,
  onSubmit,
}: WalletBalancesFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WalletBalancesFormValues>({
    resolver: zodResolver(walletBalancesFormSchema),
    defaultValues: toFormState(wallet),
  });

  useEffect(() => {
    reset(toFormState(wallet));
  }, [reset, wallet]);

  async function handleWalletBalancesSubmit(values: WalletBalancesFormValues) {
    await onSubmit({
      bankBalance: parseAmount(values.bankBalance),
      cashBalance: parseAmount(values.cashBalance),
      receivableBalance: parseAmount(values.receivableBalance),
    });
  }

  const errorMessage =
    errors.bankBalance?.message ??
    errors.cashBalance?.message ??
    errors.receivableBalance?.message ??
    null;

  const cannotSubmit = isUpdating || isSubmitting;

  return (
    <Card>
      <form
        onSubmit={handleSubmit(handleWalletBalancesSubmit)}
        className='space-y-5'
        noValidate
      >
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold text-zinc-900'>
            Atualizar saldos-base
          </h2>

          <p className='text-sm text-zinc-500'>
            Ajuste os valores reais da sua Wallet. Essa ação não cria receita ou
            despesa.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
          <Input
            id='bankBalance'
            label='Saldo em Banco'
            type='text'
            inputMode='decimal'
            aria-invalid={Boolean(errors.bankBalance)}
            aria-describedby={errors.bankBalance ? 'wallet-error' : undefined}
            {...register('bankBalance')}
          />

          <Input
            id='cashBalance'
            label='Saldo em Dinheiro'
            type='text'
            inputMode='decimal'
            aria-invalid={Boolean(errors.cashBalance)}
            aria-describedby={errors.cashBalance ? 'wallet-error' : undefined}
            {...register('cashBalance')}
          />

          <Input
            id='receivableBalance'
            label='Valores a Receber'
            type='text'
            inputMode='decimal'
            aria-invalid={Boolean(errors.receivableBalance)}
            aria-describedby={
              errors.receivableBalance ? 'wallet-error' : undefined
            }
            {...register('receivableBalance')}
          />
        </div>

        {errorMessage && (
          <div id='wallet-error'>
            <FormErrorMessage message={errorMessage} />
          </div>
        )}

        <Button type='submit' disabled={cannotSubmit} className='w-full sm:w-auto'>
          <Save aria-hidden='true' className='size-4' />
          {cannotSubmit ? 'Salvando...' : 'Salvar saldos'}
        </Button>
      </form>
    </Card>
  );
}
