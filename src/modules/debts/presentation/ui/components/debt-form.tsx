'use client';

import { SyntheticEvent, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { SelectField } from '@/shared/presentation/ui/components/select-field';
import { TextareaField } from '@/shared/presentation/ui/components/textarea-field';

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
      toast.success('Dívida atualizada com sucesso.');
      await onDebtUpdated?.();
      return;
    }

    resetCreateForm();
    toast.success('Dívida cadastrada com sucesso.');
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

        <SelectField
          id='debt-type'
          name='type'
          label='Tipo'
          value={type}
          onChange={(event) => setType(event.target.value as DebtTypeUi)}
          options={[
            { label: 'Única', value: 'ONE_TIME' },
            { label: 'Recorrente', value: 'RECURRING' },
          ]}
        />

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

        <TextareaField
          id='debt-notes'
          name='notes'
          label='Observacoes'
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        {error && <FormErrorMessage message={error} />}

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
