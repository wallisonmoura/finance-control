'use client';

import { SyntheticEvent, useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

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

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

export function DebtForm({
  onDebtCreated,
  onDebtUpdated,
  onCancel,
  editingDebt = null,
}: DebtFormProps) {
  const isEditing = Boolean(editingDebt);

  const [description, setDescription] = useState(
    () => editingDebt?.description ?? '',
  );
  const [amount, setAmount] = useState(() =>
    editingDebt ? String(editingDebt.amount).replace('.', ',') : '',
  );
  const [dueDate, setDueDate] = useState(() =>
    editingDebt ? formatDateInputValue(editingDebt.dueDate) : getTodayDateValue(),
  );
  const [type, setType] = useState<DebtTypeUi>(
    () => editingDebt?.type ?? 'ONE_TIME',
  );
  const [notes, setNotes] = useState(() => editingDebt?.notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function parseMoneyInput(value: string) {
    return Number(value.replace(',', '.'));
  }

  function resetCreateForm() {
    setDescription('');
    setAmount('');
    setDueDate(getTodayDateValue());
    setType('ONE_TIME');
    setNotes('');
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const input = {
      description,
      amount: parseMoneyInput(amount),
      dueDate,
      type,
      notes: notes.trim() ? notes : null,
    };

    const response =
      editingDebt !== null
        ? await updateDebt(editingDebt.id, input)
        : await registerDebt(input);

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingDebt !== null) {
      setSuccessMessage('Dívida atualizada com sucesso.');
      await onDebtUpdated?.();
      return;
    }

    resetCreateForm();
    setSuccessMessage('Dívida cadastrada com sucesso.');
    await onDebtCreated?.();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <h2 className='text-lg font-semibold text-black'>
            {isEditing ? 'Editar dívida' : 'Cadastrar dívida'}
          </h2>
          <p className='text-sm text-slate-500'>
            {isEditing
              ? 'Atualize os dados da dívida pendente selecionada.'
              : 'Registre um compromisso financeiro pendente.'}
          </p>
        </div>

        <div className='space-y-1'>
          <label
            htmlFor='debt-type'
            className='block text-sm font-medium text-slate-700'
          >
            Tipo
          </label>
          <select
            id='debt-type'
            name='type'
            value={type}
            onChange={(event) => setType(event.target.value as DebtTypeUi)}
            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200'
          >
            <option value='ONE_TIME'>Unica</option>
            <option value='RECURRING'>Recorrente</option>
          </select>
        </div>

        <Input
          id='debt-description'
          name='description'
          label='Descricao'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <Input
          id='debt-amount'
          name='amount'
          label='Valor'
          type='text'
          inputMode='decimal'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />

        <Input
          id='debt-due-date'
          name='dueDate'
          label='Vencimento'
          type='date'
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          required
        />

        <Input
          id='debt-notes'
          name='notes'
          label='Observacoes'
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        {error && <FormErrorMessage message={error} />}

        {successMessage && (
          <p className='text-sm text-green-700'>{successMessage}</p>
        )}

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Cadastrando...'
              : isEditing
                ? 'Salvar alteracoes'
                : 'Cadastrar divida'}
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
