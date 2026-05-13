'use client';

import { SyntheticEvent, useState } from 'react';
import { registerIncome } from '../services/finance-api.service';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Button } from '@/shared/presentation/ui/components/button';

type IncomeFormProps = {
  onIncomeCreated?: () => void;
};

export function IncomeForm({ onIncomeCreated }: IncomeFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function parseMoneyInput(value: string) {
    return Number(value.replace(',', '.'));
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const parsedAmount = parseMoneyInput(amount);

    const response = await registerIncome({
      amount: parsedAmount,
      description,
      date,
      notes: notes.trim() ? notes : null,
    });

    setIsSubmitting(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setAmount('');
    setDescription('');
    setNotes('');
    setSuccessMessage('Receita registrada com sucesso.');
    onIncomeCreated?.();
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <h2 className='text-lg text-black font-semibold'>
            Registrar receita
          </h2>
          <p className='text-sm text-slate-500'>
            Registre uma entrada real já ocorrida.
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

        {successMessage && (
          <p className='text-sm text-green-700'>{successMessage}</p>
        )}

        <Button type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar receita'}
        </Button>
      </form>
    </Card>
  );
}
