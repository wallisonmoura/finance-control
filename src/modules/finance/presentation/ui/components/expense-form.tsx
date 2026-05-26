'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronUp, Save, WalletCards, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { SelectField } from '@/shared/presentation/ui/components/select-field';
import { TextareaField } from '@/shared/presentation/ui/components/textarea-field';

import {
  registerExpense,
  updateExpense,
} from '../services/finance-api.service';
import { ExpenseCategoryUi, FinanceEntryUi } from '../types/finance-ui.types';

type ExpenseFormProps = {
  categories: ExpenseCategoryUi[];
  isLoadingCategories?: boolean;
  categoriesError?: string | null;
  onExpenseCreated?: () => void | Promise<void>;
  onExpenseUpdated?: () => void | Promise<void>;
  onCancel?: () => void;
  editingExpense?: FinanceEntryUi | null;
};

function formatDateInputValue(date: string) {
  return date.slice(0, 10);
}

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseMoneyInput(value: string) {
  return Number(value.replace(',', '.'));
}

function formatMoneyInputValue(value: number) {
  return value.toFixed(2).replace('.', ',');
}

function isBrazilianMoneyInput(value: string) {
  return /^\d+(,\d{1,2})?$/.test(value);
}

function getOptionalNotes(notes: string) {
  const trimmedNotes = notes.trim();

  return trimmedNotes ? { notes: trimmedNotes } : {};
}

function isFutureDate(value: string) {
  return value > getTodayDateValue();
}

const expenseFormSchema = z.object({
  categoryId: z.string().min(1, 'Selecione uma categoria.'),
  description: z.string().trim().min(1, 'Informe a descrição.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor.')
    .refine(isBrazilianMoneyInput, {
      message: 'Informe um valor com no máximo duas casas decimais.',
    })
    .refine((value) => parseMoneyInput(value) > 0, {
      message: 'Informe um valor maior que zero.',
    }),
  date: z
    .string()
    .min(1, 'Informe a data.')
    .refine((value) => !isFutureDate(value), {
      message: 'Informe uma data de hoje ou anterior.',
    }),
  notes: z.string(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function ExpenseForm({
  categories,
  isLoadingCategories = false,
  categoriesError = null,
  onExpenseCreated,
  onExpenseUpdated,
  onCancel,
  editingExpense = null,
}: ExpenseFormProps) {
  const isEditing = Boolean(editingExpense);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: editingExpense
        ? formatMoneyInputValue(editingExpense.amount)
        : '',
      categoryId: editingExpense?.categoryId ?? '',
      description: editingExpense?.description ?? '',
      date: editingExpense
        ? formatDateInputValue(editingExpense.date)
        : getTodayDateValue(),
      notes: editingExpense?.notes ?? '',
    },
  });

  async function handleExpenseSubmit(values: ExpenseFormValues) {
    setError(null);

    const input = {
      amount: parseMoneyInput(values.amount),
      description: values.description,
      date: values.date,
      categoryId: values.categoryId,
      ...getOptionalNotes(values.notes),
    };

    const response =
      editingExpense !== null
        ? await updateExpense(editingExpense.id, input)
        : await registerExpense(input);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingExpense !== null) {
      toast.success('Despesa atualizada com sucesso.');
      await onExpenseUpdated?.();
      return;
    }

    reset({
      amount: '',
      categoryId: '',
      description: '',
      date: getTodayDateValue(),
      notes: '',
    });
    toast.success('Despesa registrada com sucesso.');
    await onExpenseCreated?.();
  }

  const cannotSubmit =
    isSubmitting || isLoadingCategories || Boolean(categoriesError);

  return (
    <Card className='p-5 sm:p-6'>
      <form
        onSubmit={handleSubmit(handleExpenseSubmit)}
        className='space-y-6'
        noValidate
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600'>
              <WalletCards aria-hidden='true' className='size-6' />
            </div>

            <div>
              <h2 className='text-xl font-semibold text-slate-950'>
                {isEditing ? 'Editar despesa' : 'Nova despesa'}
              </h2>
              <p className='mt-1 text-sm text-slate-600'>
                {isEditing
                  ? 'Atualize os dados da despesa selecionada.'
                  : 'Preencha os dados da sua despesa'}
              </p>
            </div>
          </div>

          <ChevronUp
            aria-hidden='true'
            className='mt-2 size-4 shrink-0 text-slate-600'
          />
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <SelectField
              id='expense-category'
              label='Categoria *'
              disabled={isLoadingCategories}
              aria-invalid={Boolean(errors.categoryId)}
              aria-describedby={
                errors.categoryId ? 'expense-category-error' : undefined
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
              {...register('categoryId')}
            />
            {errors.categoryId?.message ? (
              <p
                id='expense-category-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.categoryId.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='expense-date'
              label='Data *'
              type='date'
              max={getTodayDateValue()}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'expense-date-error' : undefined}
              {...register('date')}
            />
            {errors.date?.message ? (
              <p
                id='expense-date-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.date.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='expense-description'
              label='Descrição *'
              placeholder='Ex.: Supermercado Extra'
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'expense-description-error' : undefined
              }
              {...register('description')}
            />
            {errors.description?.message ? (
              <p
                id='expense-description-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='expense-amount'
              label='Valor (R$) *'
              type='text'
              inputMode='decimal'
              placeholder='0,00'
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount ? 'expense-amount-error' : undefined
              }
              {...register('amount')}
            />
            {errors.amount?.message ? (
              <p
                id='expense-amount-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className='md:col-span-2'>
            <TextareaField
              id='expense-notes'
              label='Observação (opcional)'
              placeholder='Adicione uma observação...'
              {...register('notes')}
            />
          </div>
        </div>

        {categoriesError && <FormErrorMessage message={categoriesError} />}

        {error && <FormErrorMessage message={error} />}

        <div className='grid gap-3 pt-1 sm:flex sm:flex-wrap sm:justify-end'>
          {onCancel && (
            <Button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              variant='secondary'
              className='h-12 min-w-36 px-6 text-base'
            >
              <X aria-hidden='true' className='size-4' />
              Cancelar
            </Button>
          )}

          <Button
            type='submit'
            disabled={cannotSubmit}
            className='h-12 min-w-44 !bg-red-600 px-6 text-base !text-white hover:!bg-red-700'
          >
            <Save aria-hidden='true' className='size-4' />
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Registrando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Salvar despesa'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
