'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronUp, HandCoins, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { registerIncome, updateIncome } from '../services/finance-api.service';
import { FinanceEntryUi } from '../types/finance-ui.types';

type IncomeFormProps = {
  onIncomeCreated?: () => void | Promise<void>;
  onIncomeUpdated?: () => void | Promise<void>;
  onCancel?: () => void;
  editingIncome?: FinanceEntryUi | null;
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

const incomeFormSchema = z.object({
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

type IncomeFormValues = z.infer<typeof incomeFormSchema>;

export function IncomeForm({
  onIncomeCreated,
  onIncomeUpdated,
  onCancel,
  editingIncome = null,
}: IncomeFormProps) {
  const isEditing = Boolean(editingIncome);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: {
      amount: editingIncome ? formatMoneyInputValue(editingIncome.amount) : '',
      description: editingIncome?.description ?? '',
      date: editingIncome
        ? formatDateInputValue(editingIncome.date)
        : getTodayDateValue(),
      notes: editingIncome?.notes ?? '',
    },
  });

  async function handleIncomeSubmit(values: IncomeFormValues) {
    setError(null);

    const input = {
      amount: parseMoneyInput(values.amount),
      description: values.description,
      date: values.date,
      ...getOptionalNotes(values.notes),
    };

    const response =
      editingIncome !== null
        ? await updateIncome(editingIncome.id, input)
        : await registerIncome(input);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingIncome !== null) {
      toast.success('Receita atualizada com sucesso.');
      await onIncomeUpdated?.();
      return;
    }

    reset({
      amount: '',
      description: '',
      date: getTodayDateValue(),
      notes: '',
    });
    toast.success('Receita registrada com sucesso.');
    await onIncomeCreated?.();
  }

  return (
    <Card className='p-5 sm:p-6'>
      <form
        onSubmit={handleSubmit(handleIncomeSubmit)}
        className='space-y-6'
        noValidate
      >
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-center gap-4'>
            <div className='flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600'>
              <HandCoins aria-hidden='true' className='size-6' />
            </div>

            <div>
              <h2 className='text-xl font-semibold text-slate-950'>
                {isEditing ? 'Editar receita' : 'Nova receita'}
              </h2>
              <p className='mt-1 text-sm text-slate-600'>
                {isEditing
                  ? 'Atualize os dados da receita selecionada.'
                  : 'Preencha os dados da sua receita'}
              </p>
            </div>
          </div>

          <ChevronUp
            aria-hidden='true'
            className='mt-2 size-4 shrink-0 text-slate-600'
          />
        </div>

        <div className='grid gap-4 lg:grid-cols-[1.35fr_0.8fr_0.8fr]'>
          <div>
            <Input
              id='income-description'
              label='Descrição *'
              placeholder='Ex.: Corrida Uber'
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'income-description-error' : undefined
              }
              {...register('description')}
            />
            {errors.description?.message ? (
              <p
                id='income-description-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='income-amount'
              label='Valor (R$) *'
              type='text'
              inputMode='decimal'
              placeholder='0,00'
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount ? 'income-amount-error' : undefined
              }
              {...register('amount')}
            />
            {errors.amount?.message ? (
              <p
                id='income-amount-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.amount.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='income-date'
              label='Data *'
              type='date'
              max={getTodayDateValue()}
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? 'income-date-error' : undefined}
              {...register('date')}
            />
            {errors.date?.message ? (
              <p
                id='income-date-error'
                className='mt-1 text-sm font-medium text-red-600'
              >
                {errors.date.message}
              </p>
            ) : null}
          </div>

          <div className='lg:col-span-3'>
            <Input
              id='income-notes'
              label='Observação (opcional)'
              placeholder='Adicione uma observação...'
              {...register('notes')}
            />
          </div>
        </div>

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
            disabled={isSubmitting}
            className='h-12 min-w-44 px-6 text-base'
          >
            <Save aria-hidden='true' className='size-4' />
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Registrando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Salvar receita'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
