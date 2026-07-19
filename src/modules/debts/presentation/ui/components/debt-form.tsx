'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { getTodayDateValue } from '@/shared/presentation/ui/lib/date';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import { registerDebt, updateDebt } from '../services/debt-api.service';
import { DebtTypeUi, DebtUi } from '../types/debt-ui.types';

type DebtFormProps = {
  onDebtCreated?: () => void | Promise<void>;
  onDebtUpdated?: () => void | Promise<void>;
  onCancel?: () => void;
  editingDebt?: DebtUi | null;
};

function formatDateInputValue(date: string) {
  return date.slice(0, 10);
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

const debtFormSchema = z.object({
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
  dueDate: z.string().min(1, 'Informe o vencimento.'),
  type: z.enum(['ONE_TIME', 'RECURRING']),
  notes: z.string(),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

export function DebtForm({
  onDebtCreated,
  onDebtUpdated,
  onCancel,
  editingDebt = null,
}: DebtFormProps) {
  const isEditing = Boolean(editingDebt);

  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtFormSchema),
    defaultValues: {
      amount: editingDebt ? formatMoneyInputValue(editingDebt.amount) : '',
      description: editingDebt?.description ?? '',
      dueDate: editingDebt
        ? formatDateInputValue(editingDebt.dueDate)
        : getTodayDateValue(),
      type: editingDebt?.type ?? 'ONE_TIME',
      notes: editingDebt?.notes ?? '',
    },
  });

  async function handleDebtSubmit(values: DebtFormValues) {
    setError(null);

    const input = {
      description: values.description,
      amount: parseMoneyInput(values.amount),
      dueDate: values.dueDate,
      type: values.type as DebtTypeUi,
      ...getOptionalNotes(values.notes),
    };

    const response =
      editingDebt !== null
        ? await updateDebt(editingDebt.id, input)
        : await registerDebt(input);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingDebt !== null) {
      toast.success('Dívida atualizada com sucesso.');
      await onDebtUpdated?.();
      return;
    }

    reset({
      amount: '',
      description: '',
      dueDate: getTodayDateValue(),
      type: 'ONE_TIME',
      notes: '',
    });
    toast.success('Dívida cadastrada com sucesso.');
    await onDebtCreated?.();
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit(handleDebtSubmit)}
        className='space-y-4'
        noValidate
      >
        <div>
          <h2 className='text-lg font-semibold text-foreground'>
            {isEditing ? 'Editar dívida' : 'Cadastrar dívida'}
          </h2>
          <p className='text-sm text-muted-foreground'>
            {isEditing
              ? 'Atualize os dados da dívida pendente selecionada.'
              : 'Registre um compromisso financeiro pendente.'}
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-2'>
          <SelectField
            id='debt-type'
            label='Tipo'
            options={[
              { label: 'Única', value: 'ONE_TIME' },
              { label: 'Recorrente', value: 'RECURRING' },
            ]}
            {...register('type')}
          />

          <div>
            <Input
              id='debt-due-date'
              label='Vencimento'
              type='date'
              aria-invalid={Boolean(errors.dueDate)}
              aria-describedby={
                errors.dueDate ? 'debt-due-date-error' : undefined
              }
              {...register('dueDate')}
            />
            {errors.dueDate?.message ? (
              <p
                id='debt-due-date-error'
                className='mt-1 text-sm font-medium text-destructive'
              >
                {errors.dueDate.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='debt-description'
              label='Descrição'
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'debt-description-error' : undefined
              }
              {...register('description')}
            />
            {errors.description?.message ? (
              <p
                id='debt-description-error'
                className='mt-1 text-sm font-medium text-destructive'
              >
                {errors.description.message}
              </p>
            ) : null}
          </div>

          <div>
            <Input
              id='debt-amount'
              label='Valor'
              type='text'
              inputMode='decimal'
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? 'debt-amount-error' : undefined}
              {...register('amount')}
            />
            {errors.amount?.message ? (
              <p
                id='debt-amount-error'
                className='mt-1 text-sm font-medium text-destructive'
              >
                {errors.amount.message}
              </p>
            ) : null}
          </div>

          <div className='md:col-span-2'>
            <Input id='debt-notes' label='Observações' {...register('notes')} />
          </div>
        </div>

        {error && <FormErrorMessage message={error} />}

        <div className='grid gap-2 sm:flex sm:flex-wrap sm:justify-end'>
          {onCancel && (
            <Button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              variant='secondary'
              className='h-10 min-w-36 px-6 text-base'
            >
              <X aria-hidden='true' className='size-4' />
              Cancelar
            </Button>
          )}
          <Button
            type='submit'
            disabled={isSubmitting}
            variant='custom'
            className='h-10 min-w-44 bg-income px-4 text-base text-primary-foreground hover:bg-income/90'
          >
            <Save aria-hidden='true' className='size-4' />
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Cadastrando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Cadastrar dívida'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
