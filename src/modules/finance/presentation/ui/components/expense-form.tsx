'use client';

import { SyntheticEvent, useState } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

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

  const [amount, setAmount] = useState(() =>
    editingExpense ? String(editingExpense.amount).replace('.', ',') : '',
  );
  const [description, setDescription] = useState(
    () => editingExpense?.description ?? '',
  );
  const [date, setDate] = useState(() =>
    editingExpense
      ? formatDateInputValue(editingExpense.date)
      : new Date().toISOString().slice(0, 10),
  );
  const [categoryId, setCategoryId] = useState(
    () => editingExpense?.categoryId ?? '',
  );
  const [notes, setNotes] = useState(() => editingExpense?.notes ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function parseMoneyInput(value: string) {
    return Number(value.replace(',', '.'));
  }

  function resetCreateForm() {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setCategoryId('');
    setNotes('');
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const input = {
      amount: parseMoneyInput(amount),
      description,
      date,
      categoryId,
      notes: notes.trim() ? notes : null,
    };

    const response =
      editingExpense !== null
        ? await updateExpense(editingExpense.id, input)
        : await registerExpense(input);

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    if (editingExpense !== null) {
      setSuccessMessage('Despesa atualizada com sucesso.');
      await onExpenseUpdated?.();
      return;
    }

    resetCreateForm();
    setSuccessMessage('Despesa registrada com sucesso.');
    await onExpenseCreated?.();
  }

  const cannotSubmit =
    isSubmitting || isLoadingCategories || Boolean(categoriesError);

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <h2 className='text-lg font-semibold text-black'>
            {isEditing ? 'Editar despesa' : 'Registrar despesa'}
          </h2>
          <p className='text-sm text-slate-500'>
            {isEditing
              ? 'Atualize os dados da despesa selecionada.'
              : 'Registre uma saida real ja ocorrida.'}
          </p>
        </div>

        <div className='space-y-1'>
          <label
            htmlFor='expense-category'
            className='block text-sm font-medium text-slate-700'
          >
            Categoria
          </label>
          <select
            id='expense-category'
            name='categoryId'
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isLoadingCategories}
            required
            className='w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100 disabled:text-slate-500'
          >
            <option value=''>
              {isLoadingCategories
                ? 'Carregando categorias...'
                : 'Selecione uma categoria'}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          id='expense-description'
          name='description'
          label='Descricao'
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />

        <Input
          id='expense-amount'
          name='amount'
          label='Valor'
          type='text'
          inputMode='decimal'
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />

        <Input
          id='expense-date'
          name='date'
          label='Data'
          type='date'
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <Input
          id='expense-notes'
          name='notes'
          label='Observacoes'
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />

        {categoriesError && <FormErrorMessage message={categoriesError} />}

        {error && <FormErrorMessage message={error} />}

        {successMessage && (
          <p className='text-sm text-green-700'>{successMessage}</p>
        )}

        <div className='flex flex-wrap gap-2'>
          <Button type='submit' disabled={cannotSubmit}>
            {isSubmitting
              ? isEditing
                ? 'Salvando...'
                : 'Registrando...'
              : isEditing
                ? 'Salvar alteracoes'
                : 'Registrar despesa'}
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
