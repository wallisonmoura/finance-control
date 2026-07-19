'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { LockKeyhole, WalletCards, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { ExpenseCategoryUi } from '@/modules/finance/presentation/ui/types/finance-ui.types';
import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { getTodayDateValue } from '@/shared/presentation/ui/lib/date';
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
  embedded?: boolean;
};

function isFutureDate(value: string) {
  return value > getTodayDateValue();
}

const debtPaymentFormSchema = z.object({
  expenseCategoryId: z.string().min(1, 'Selecione uma categoria.'),
  paymentSource: z.enum(['BANK', 'CASH', 'RECEIVABLE']),
  paidAt: z
    .string()
    .min(1, 'Informe a data do pagamento.')
    .refine((value) => !isFutureDate(value), {
      message: 'Informe uma data de hoje ou anterior.',
    }),
});

type DebtPaymentFormValues = z.infer<typeof debtPaymentFormSchema>;

export function DebtPaymentForm({
  debt,
  categories,
  isLoadingCategories = false,
  categoriesError = null,
  onDebtPaid,
  onCancel,
  embedded = false,
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

  const content = (
    <div
      className={
        embedded
          ? 'rounded-xl border border-warning/30 bg-warning-muted/30 p-4 sm:p-5'
          : ''
      }
    >
      <form
        onSubmit={handleSubmit(handleDebtPaymentSubmit)}
        className='space-y-5'
        noValidate
      >
        <div className='flex items-center gap-4'>
          <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-warning-muted text-warning'>
            <WalletCards aria-hidden='true' className='size-6' />
          </div>

          <div className='min-w-0'>
            <h2 className='text-lg font-semibold text-foreground'>
              Pagar dívida
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Preencha os dados abaixo para gerar a despesa e atualizar sua
              Carteira.
            </p>
          </div>
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
                className='mt-1 text-sm font-medium text-destructive'
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
              max={getTodayDateValue()}
              aria-invalid={Boolean(errors.paidAt)}
              aria-describedby={
                errors.paidAt ? 'debt-payment-paid-at-error' : undefined
              }
              {...register('paidAt')}
            />
            {errors.paidAt?.message ? (
              <p
                id='debt-payment-paid-at-error'
                className='mt-1 text-sm font-medium text-destructive'
              >
                {errors.paidAt.message}
              </p>
            ) : null}
          </div>
        </div>

        {categoriesError && <FormErrorMessage message={categoriesError} />}

        <div className='grid gap-3 sm:flex sm:flex-wrap sm:justify-end'>
          {onCancel && (
            <Button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              variant='secondary'
              className='h-12 px-6'
            >
              <X aria-hidden='true' className='size-4' />
              Cancelar
            </Button>
          )}
          <Button
            type='submit'
            disabled={cannotSubmit}
            variant='custom'
            className='h-12 bg-primary px-6 text-primary-foreground hover:bg-primary/90'
          >
            <LockKeyhole aria-hidden='true' className='size-4' />
            {isSubmitting ? 'Pagando...' : 'Confirmar pagamento'}
          </Button>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return content;
  }

  return <Card>{content}</Card>;
}
