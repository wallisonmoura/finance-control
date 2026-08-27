'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { getTodayDateValue } from '@/shared/presentation/ui/lib/date';
import { Label } from '@/shared/presentation/ui/primitives/label';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  registerDebt,
  registerInstallmentDebt,
  updateDebt,
} from '../services/debt-api.service';
import {
  DebtTypeUi,
  DebtUi,
  RegisterInstallmentDebtUiInput,
} from '../types/debts-ui.types';

const MIN_INSTALLMENT_COUNT = 2;
const MAX_INSTALLMENT_COUNT = 12;

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

// Approximate preview only — the exact amount per installment (with the
// rounding remainder on the last one) is always computed by the backend,
// so this never needs to match it exactly.
function formatInstallmentPreview(
  amountInput: string,
  installmentCount: string,
): string | null {
  const total = parseMoneyInput(amountInput);
  const count = Number(installmentCount);

  if (!Number.isFinite(total) || total <= 0 || !Number.isInteger(count)) {
    return null;
  }

  const perInstallment = total / count;

  return `${count}x de aprox. R$ ${formatMoneyInputValue(perInstallment)} cada (a última parcela pode variar alguns centavos)`;
}

// Same approximation as formatInstallmentPreview, applied per option — the
// exact split (last installment absorbing the rounding remainder) is always
// computed by the backend.
function getInstallmentCountOptions(amountInput: string) {
  const total = parseMoneyInput(amountInput);
  const hasValidTotal = Number.isFinite(total) && total > 0;

  return Array.from(
    { length: MAX_INSTALLMENT_COUNT - MIN_INSTALLMENT_COUNT + 1 },
    (_, index) => {
      const count = MIN_INSTALLMENT_COUNT + index;
      const label = hasValidTotal
        ? `${count}x R$ ${formatMoneyInputValue(total / count)}`
        : `${count}x`;

      return { label, value: String(count) };
    },
  );
}

const debtFormSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, 'Informe a descrição.')
    .max(255, 'Descrição deve ter no máximo 255 caracteres.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Informe o valor.')
    .refine(isBrazilianMoneyInput, {
      message: 'Informe um valor com no máximo duas casas decimais.',
    })
    .refine((value) => parseMoneyInput(value) > 0, {
      message: 'Informe um valor maior que zero.',
    })
    .refine((value) => parseMoneyInput(value) <= 999999999999.99, {
      message: 'Informe um valor de até R$ 999.999.999.999,99.',
    }),
  dueDate: z.string().min(1, 'Informe o vencimento.'),
  // INSTALLMENT is never user-selectable here (see isEditingInstallment
  // below) — it's included only so editing an existing installment row can
  // round-trip its type through the form without corrupting it.
  type: z.enum(['ONE_TIME', 'INSTALLMENT', 'RECURRING']),
  notes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres.'),
});

type DebtFormValues = z.infer<typeof debtFormSchema>;

export function DebtForm({
  onDebtCreated,
  onDebtUpdated,
  onCancel,
  editingDebt = null,
}: DebtFormProps) {
  const isEditing = Boolean(editingDebt);
  // An installment row's type is system-assigned when it's created (see
  // RegisterInstallmentDebtUseCase) and must never be reassigned through
  // this generic form — the Tipo select only ever offers "Única"/
  // "Recorrente", so it's hidden here and the original type is preserved
  // as-is on submit.
  const isEditingInstallment = isEditing && editingDebt?.type === 'INSTALLMENT';

  const [error, setError] = useState<string | null>(null);
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentCount, setInstallmentCount] = useState(
    String(MIN_INSTALLMENT_COUNT),
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
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

  const amountValue = useWatch({ control, name: 'amount' });
  const installmentPreview =
    isInstallment && !isEditing
      ? formatInstallmentPreview(amountValue, installmentCount)
      : null;
  const installmentCountOptions = getInstallmentCountOptions(amountValue);

  async function handleDebtSubmit(values: DebtFormValues) {
    setError(null);

    if (isInstallment && editingDebt === null) {
      const installmentInput: RegisterInstallmentDebtUiInput = {
        description: values.description,
        amount: parseMoneyInput(values.amount),
        dueDate: values.dueDate,
        installmentCount: Number(installmentCount),
        ...getOptionalNotes(values.notes),
      };

      const installmentResponse = await registerInstallmentDebt(
        installmentInput,
      );

      if (installmentResponse.error) {
        setError(installmentResponse.error);
        return;
      }

      reset({
        amount: '',
        description: '',
        dueDate: getTodayDateValue(),
        type: 'ONE_TIME',
        notes: '',
      });
      setIsInstallment(false);
      setInstallmentCount(String(MIN_INSTALLMENT_COUNT));
      toast.success(
        `${installmentResponse.data?.length ?? 0} parcelas cadastradas com sucesso.`,
      );
      await onDebtCreated?.();
      return;
    }

    const input = {
      description: values.description,
      amount: parseMoneyInput(values.amount),
      dueDate: values.dueDate,
      type: (isEditingInstallment ? 'INSTALLMENT' : values.type) as DebtTypeUi,
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
          {!isEditing && (
            <div className='flex items-center gap-2 md:col-span-2'>
              <input
                id='debt-is-installment'
                type='checkbox'
                checked={isInstallment}
                onChange={(event) => setIsInstallment(event.target.checked)}
                className='h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring'
              />
              <Label htmlFor='debt-is-installment' className='text-foreground'>
                Dividir em parcelas?
              </Label>
            </div>
          )}

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
              id='debt-due-date'
              label={
                isInstallment && !isEditing
                  ? 'Vencimento da 1ª parcela'
                  : 'Vencimento'
              }
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
              id='debt-amount'
              label={isInstallment && !isEditing ? 'Valor total' : 'Valor'}
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
            {installmentPreview ? (
              <p className='mt-1 text-sm text-muted-foreground'>
                {installmentPreview}
              </p>
            ) : null}
          </div>

          {isInstallment && !isEditing ? (
            <SelectField
              id='debt-installment-count'
              label='Número de parcelas'
              value={installmentCount}
              onChange={(event) => setInstallmentCount(event.target.value)}
              options={installmentCountOptions}
            />
          ) : isEditingInstallment ? (
            <div>
              <Label className='text-foreground'>Tipo</Label>
              <p className='mt-2 text-sm text-muted-foreground'>
                Parcelada (parte de um parcelamento, não pode ser alterada
                aqui)
              </p>
            </div>
          ) : (
            <SelectField
              id='debt-type'
              label='Tipo'
              options={[
                { label: 'Única', value: 'ONE_TIME' },
                { label: 'Recorrente', value: 'RECURRING' },
              ]}
              {...register('type')}
            />
          )}

          <div className='md:col-span-2'>
            <Input
              id='debt-notes'
              label='Observações'
              aria-invalid={Boolean(errors.notes)}
              aria-describedby={errors.notes ? 'debt-notes-error' : undefined}
              {...register('notes')}
            />
            {errors.notes?.message ? (
              <p
                id='debt-notes-error'
                className='mt-1 text-sm font-medium text-destructive'
              >
                {errors.notes.message}
              </p>
            ) : null}
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
