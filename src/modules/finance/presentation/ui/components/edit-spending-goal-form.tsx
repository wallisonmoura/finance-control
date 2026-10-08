'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { setCategoryMonthlyLimit } from '../services/finance-api.service';
import {
  formatGoalLimitInput,
  parseGoalLimitInput,
  validateGoalLimitInput,
} from '../utils/parse-goal-limit';
import { GoalAverageHint } from './goal-average-hint';

type EditSpendingGoalFormProps = {
  categoryId: string;
  categoryName: string;
  // null when the category has no goal yet ("Definir meta").
  initialLimit: number | null;
  average: number | null;
  // Overrides the hint label when the average is not the 3-month one.
  averageLabel?: string;
  onSaved: (limit: number) => void;
  onCancel: () => void;
};

// Sets the limit of one category: edits a goal on /relatorios/metas and
// defines or edits it on the category history page. The category itself is
// fixed (remove the goal and create another one to switch categories).
export function EditSpendingGoalForm({
  categoryId,
  categoryName,
  initialLimit,
  average,
  averageLabel,
  onSaved,
  onCancel,
}: EditSpendingGoalFormProps) {
  const [limitInput, setLimitInput] = useState(
    initialLimit === null ? '' : formatGoalLimitInput(initialLimit),
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const limitError = validateGoalLimitInput(limitInput);

    if (limitError) {
      setError(limitError);
      return;
    }

    const limit = parseGoalLimitInput(limitInput);

    setError(null);
    setIsSaving(true);
    const response = await setCategoryMonthlyLimit(categoryId, limit);
    setIsSaving(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    onSaved(limit);
  }

  return (
    <form className='space-y-3' onSubmit={handleSubmit} noValidate>
      <div className='max-w-xs space-y-1.5'>
        <Input
          id={`goal-limit-${categoryId}`}
          label={
            initialLimit === null
              ? `Limite mensal de ${categoryName}`
              : `Novo limite de ${categoryName}`
          }
          type='text'
          inputMode='decimal'
          value={limitInput}
          onChange={(event) => setLimitInput(event.target.value)}
        />
        <GoalAverageHint average={average} label={averageLabel} />
      </div>

      <FormErrorMessage message={error} />

      <div className='flex gap-2'>
        <Button type='button' variant='secondary' onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type='submit' disabled={isSaving}>
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
