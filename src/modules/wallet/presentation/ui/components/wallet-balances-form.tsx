'use client';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ShieldCheck } from 'lucide-react';
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
    bankBalance: wallet.bankBalance.toFixed(2).replace('.', ','),
    cashBalance: wallet.cashBalance.toFixed(2).replace('.', ','),
    receivableBalance: wallet.receivableBalance.toFixed(2).replace('.', ','),
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
    <Card className='p-5 sm:p-6'>
      <form
        onSubmit={handleSubmit(handleWalletBalancesSubmit)}
        className='space-y-6'
        noValidate
      >
        <div className='grid gap-6 lg:grid-cols-[1fr_30%] lg:items-center'>
          <div className='space-y-6'>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold text-slate-950'>
                Atualizar saldos-base
              </h2>

              <p className='text-sm leading-6 text-slate-600'>
                Ajuste os valores reais da sua Wallet. Essa ação não cria
                receita ou despesa.
              </p>
            </div>

            <div className='grid gap-4 md:grid-cols-3'>
              <Input
                id='bankBalance'
                label='Saldo em Banco'
                type='text'
                inputMode='decimal'
                aria-invalid={Boolean(errors.bankBalance)}
                aria-describedby={
                  errors.bankBalance ? 'wallet-error' : undefined
                }
                {...register('bankBalance')}
              />

              <Input
                id='cashBalance'
                label='Saldo em Dinheiro'
                type='text'
                inputMode='decimal'
                aria-invalid={Boolean(errors.cashBalance)}
                aria-describedby={
                  errors.cashBalance ? 'wallet-error' : undefined
                }
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

            <Button
              type='submit'
              disabled={cannotSubmit}
              className='h-12 w-full bg-primary px-6 text-white hover:bg-slate-900 sm:w-auto'
            >
              <Save aria-hidden='true' className='size-4' />
              {cannotSubmit ? 'Salvando...' : 'Salvar saldos'}
            </Button>
          </div>

          <div className='flex flex-col items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/70 px-5 py-6 text-center text-sm leading-6 text-slate-700 lg:min-h-36'>
            <ShieldCheck
              aria-hidden='true'
              className='mb-3 size-8 shrink-0 text-emerald-600'
            />
            <p>
              Esses valores representam seus saldos-base e são usados para o
              total da Wallet.
            </p>
          </div>
        </div>
      </form>
    </Card>
  );
}
