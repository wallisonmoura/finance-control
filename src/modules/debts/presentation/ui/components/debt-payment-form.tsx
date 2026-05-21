'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

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

const debtPaymentFormSchema = z.object({
  expenseCategoryId: z.string().min(1, 'Selecione uma categoria.'),
  paymentSource: z.enum(['BANK', 'CASH', 'RECEIVABLE']),
  paidAt: z.string().min(1, 'Informe a data do pagamento.'),
});

type DebtPaymentFormValues = z.infer<typeof debtPaymentFormSchema>;

export function DebtPaymentForm({
  debt,
  categories,
  isLoadingCategories = false,
  categoriesError = null,
  onDebtPaid,
  onCancel,
}: DebtPaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DebtPaymentFormValues>({
    resolver: zodResolver(debtPaymentFormSchema),
    defaultValues: {
      expenseCategoryId: '',
      paymentSource: 'BANK',
      paidAt: getTodayDateValue(),
    },
  });

  async function handleDebtPaymentSubmit(values: DebtPaymentFormValues) {
    const response = await payDebt(debt.id, {
      paidAt: values.paidAt,
      expenseCategoryId: values.expenseCategoryId,
      paymentSource: values.paymentSource as DebtPaymentSourceUi,
    });

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
      <form
        onSubmit={handleSubmit(handleDebtPaymentSubmit)}
        className='space-y-4'
        noValidate
      >
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

        <div className='grid gap-4 lg:grid-cols-3'>
          <div>
            <SelectField
              id='debt-payment-category'
              label='Categoria da despesa'
              disabled={isLoadingCategories}
              aria-invalid={Boolean(errors.expenseCategoryId)}
              aria-describedby={
                errors.expenseCategoryId
                  ? 'debt-payment-category-error'
                  : undefined
              }
              placeholder={
                isLoadingCategories
                  ? 'Carregando categorias...'
                  : 'Selecione uma categoria'
              }
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              {...register('expenseCategoryId')}
            />
            {errors.expenseCategoryId?.message ? (
              <p
                id='debt-payment-category-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.expenseCategoryId.message}
              </p>
            ) : null}
          </div>

          <SelectField
            id='debt-payment-source'
            label='Origem do pagamento'
            options={[
              { label: 'Banco', value: 'BANK' },
              { label: 'Dinheiro', value: 'CASH' },
              { label: 'Recebíveis', value: 'RECEIVABLE' },
            ]}
            {...register('paymentSource')}
          />

          <div>
            <Input
              id='debt-paid-at'
              label='Data do pagamento'
              type='date'
              aria-invalid={Boolean(errors.paidAt)}
              aria-describedby={
                errors.paidAt ? 'debt-payment-paid-at-error' : undefined
              }
              {...register('paidAt')}
            />
            {errors.paidAt?.message ? (
              <p
                id='debt-payment-paid-at-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.paidAt.message}
              </p>
            ) : null}
          </div>
        </div>

        {categoriesError && <FormErrorMessage message={categoriesError} />}

        <div className='grid gap-2 sm:flex sm:flex-wrap'>
          <Button type='submit' disabled={cannotSubmit}>
            <CreditCard aria-hidden='true' className='size-4' />
            {isSubmitting ? 'Pagando...' : 'Confirmar pagamento'}
          </Button>

          {onCancel && (
            <Button type='button' onClick={onCancel} disabled={isSubmitting}>
              <X aria-hidden='true' className='size-4' />
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
