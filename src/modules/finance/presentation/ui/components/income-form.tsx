'use client';

import { SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

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

export function IncomeForm({
  onIncomeCreated,
  onIncomeUpdated,
  onCancel,
  editingIncome = null,
}: IncomeFormProps) {
  const isEditing = Boolean(editingIncome);

  const [amount, setAmount] = useState(() =>
    editingIncome ? String(editingIncome.amount).replace('.', ',') : '',
  );

  const [description, setDescription] = useState(
    () => editingIncome?.description ?? '',
  );

  const [date, setDate] = useState(() =>
    editingIncome
      ? formatDateInputValue(editingIncome.date)
      : new Date().toISOString().slice(0, 10),
  );

  const [notes, setNotes] = useState(() => editingIncome?.notes ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function parseMoneyInput(value: string) {
    return Number(value.replace(',', '.'));
  }

  function resetCreateForm() {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setNotes('');
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);

    const parsedAmount = parseMoneyInput(amount);

    const input = {
      amount: parsedAmount,
      description,
      date,
      notes: notes.trim() ? notes : null,
    };

    const response =
      editingIncome !== null
        ? await updateIncome(editingIncome.id, input)
        : await registerIncome(input);

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingIncome !== null) {
      toast.success('Receita atualizada com sucesso.');
      await onIncomeUpdated?.();
      return;
    }

    resetCreateForm();
    toast.success('Receita registrada com sucesso.');
    await onIncomeCreated?.();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <h2 className='text-lg font-semibold text-black'>
            {isEditing ? 'Editar receita' : 'Registrar receita'}
          </h2>
          <p className='text-sm text-slate-500'>
            {isEditing
              ? 'Atualize os dados da receita selecionada.'
              : 'Registre uma entrada real já ocorrida.'}
          </p>
        </div>

        <Input
          id='income-description'
          name='description'
          label='Descrição'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <Input
          id='income-amount'
          name='amount'
          label='Valor'
          type='text'
          inputMode='decimal'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />

        <Input
          id='income-date'
          name='date'
          label='Data'
          type='date'
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <Input
          id='income-notes'
          name='notes'
          label='Observações'
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        {error && <FormErrorMessage message={error} />}

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Registrando...'
              : isEditing
                ? 'Salvar alterações'
                : 'Registrar receita'}
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
