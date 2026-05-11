'use client';

import { SyntheticEvent, useEffect, useState } from 'react';

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
    bankBalance: String(wallet.bankBalance),
    cashBalance: String(wallet.cashBalance),
    receivableBalance: String(wallet.receivableBalance),
  };
}

function parseAmount(value: string) {
  return Number(value.replace(',', '.'));
}

function isValidAmount(value: string) {
  if (!value.trim()) {
    return false;
  }

  const amount = parseAmount(value);

  return Number.isFinite(amount) && amount >= 0;
}

export function WalletBalancesForm({
  wallet,
  isUpdating,
  onSubmit,
}: WalletBalancesFormProps) {
  const [formState, setFormState] = useState<WalletBalancesFormState>(() =>
    toFormState(wallet),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setFormState(toFormState(wallet));
  }, [wallet]);

  function handleChange(field: keyof WalletBalancesFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));

    setErrorMessage(null);
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid =
      isValidAmount(formState.bankBalance) &&
      isValidAmount(formState.cashBalance) &&
      isValidAmount(formState.receivableBalance);

    if (!isValid) {
      setErrorMessage(INVALID_AMOUNT_MESSAGE);
      return;
    }

    await onSubmit({
      bankBalance: parseAmount(formState.bankBalance),
      cashBalance: parseAmount(formState.cashBalance),
      receivableBalance: parseAmount(formState.receivableBalance),
    });
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-5'>
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
            name='bankBalance'
            label='Saldo em Banco'
            type='text'
            inputMode='decimal'
            value={formState.bankBalance}
            onChange={(event) =>
              handleChange('bankBalance', event.target.value)
            }
          />

          <Input
            id='cashBalance'
            name='cashBalance'
            label='Saldo em Dinheiro'
            type='text'
            inputMode='decimal'
            value={formState.cashBalance}
            onChange={(event) =>
              handleChange('cashBalance', event.target.value)
            }
          />

          <Input
            id='receivableBalance'
            name='receivableBalance'
            label='Valores a Receber'
            type='text'
            inputMode='decimal'
            value={formState.receivableBalance}
            onChange={(event) =>
              handleChange('receivableBalance', event.target.value)
            }
          />
        </div>

        {errorMessage && <FormErrorMessage message={errorMessage} />}

        <Button type='submit' disabled={isUpdating}>
          {isUpdating ? 'Salvando...' : 'Salvar saldos'}
        </Button>
      </form>
    </Card>
  );
}
