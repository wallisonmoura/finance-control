'use client';

import { SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { ExpenseCategoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

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

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);

    const response = await payDebt(debt.id, {
      paidAt,
      expenseCategoryId,
      paymentSource,
    });

    setIsSubmitting(false);

    if (response.error) {
      toast.error(response.error);
      return;
    }

    toast.success('Dívida paga com sucesso.');
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

        <SelectField
          id='debt-payment-category'
          name='expenseCategoryId'
          label='Categoria da despesa'
          value={expenseCategoryId}
          onChange={(event) => setExpenseCategoryId(event.target.value)}
          disabled={isLoadingCategories}
          required
          placeholder={
            isLoadingCategories
              ? 'Carregando categorias...'
              : 'Selecione uma categoria'
          }
          options={categories.map((category) => ({
            label: category.name,
            value: category.id,
          }))}
        />

        <SelectField
          id='debt-payment-source'
          name='paymentSource'
          label='Origem do pagamento'
          value={paymentSource}
          onChange={(event) =>
            setPaymentSource(event.target.value as DebtPaymentSourceUi)
          }
          options={[
            { label: 'Banco', value: 'BANK' },
            { label: 'Dinheiro', value: 'CASH' },
            { label: 'Recebíveis', value: 'RECEIVABLE' },
          ]}
        />

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
