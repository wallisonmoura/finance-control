'use client';

import { SyntheticEvent, useState } from 'react';

import { ExpenseCategoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

import { payDebt } from '../services/debt-api.service';
import { DebtPaymentSourceUi, DebtUi } from '../types/debt-ui.types';

type DebtPaymentFormProps = {
  debt: DebtUi;
  categories: ExpenseCategoryUi[];
  isLoadingCategories?: boolean;
  categoriesError?: string | null;
  onDebtPaid?: () => void | Promise<void>;
  onCancel?: () => void;
};

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export function DebtPaymentForm({
  debt,
  categories,
  isLoadingCategories = false,
  categoriesError = null,
  onDebtPaid,
  onCancel,
}: DebtPaymentFormProps) {
  const [paidAt, setPaidAt] = useState(getTodayDateValue);
  const [expenseCategoryId, setExpenseCategoryId] = useState('');
  const [paymentSource, setPaymentSource] =
    useState<DebtPaymentSourceUi>('BANK');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const response = await payDebt(debt.id, {
      paidAt,
      expenseCategoryId,
      paymentSource,
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setSuccessMessage('Dívida paga com sucesso.');
    await onDebtPaid?.();
  }

  const cannotSubmit =
    isSubmitting || isLoadingCategories || Boolean(categoriesError);

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-black'>Pagar dívida</h2>
            <p className='text-sm text-slate-500'>{debt.description}</p>
          </div>

          <MoneyDisplay
            value={debt.amount}
            className='text-lg font-semibold text-red-700'
          />
        </div>

        <div className='space-y-1'>
          <label
            htmlFor='debt-payment-category'
            className='block text-sm font-medium text-slate-700'
          >
            Categoria da despesa
          </label>
          <select
            id='debt-payment-category'
            name='expenseCategoryId'
            value={expenseCategoryId}
            onChange={(event) => setExpenseCategoryId(event.target.value)}
            disabled={isLoadingCategories}
            required
            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 disabled:text-slate-500'
          >
            <option value=''>
              {isLoadingCategories
                ? 'Carregando categorias...'
                : 'Selecione uma categoria'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className='space-y-1'>
          <label
            htmlFor='debt-payment-source'
            className='block text-sm font-medium text-slate-700'
          >
            Origem do pagamento
          </label>
          <select
            id='debt-payment-source'
            name='paymentSource'
            value={paymentSource}
            onChange={(event) =>
              setPaymentSource(event.target.value as DebtPaymentSourceUi)
            }
            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200'
          >
            <option value='BANK'>Banco</option>
            <option value='CASH'>Dinheiro</option>
            <option value='RECEIVABLE'>Recebíveis</option>
          </select>
        </div>

        <Input
          id='debt-paid-at'
          name='paidAt'
          label='Data do pagamento'
          type='date'
          value={paidAt}
          onChange={(event) => setPaidAt(event.target.value)}
          required
        />

        {categoriesError && <FormErrorMessage message={categoriesError} />}

        {error && <FormErrorMessage message={error} />}

        {successMessage && (
          <p className='text-sm text-green-700'>{successMessage}</p>
        )}

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' disabled={cannotSubmit}>
            {isSubmitting ? 'Pagando...' : 'Confirmar pagamento'}
          </Button>

          {onCancel && (
            <Button type='button' onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
