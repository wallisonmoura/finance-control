'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { setCategoryMonthlyLimit } from '../services/finance-api.service';
import { SpendingGoalUi } from '../types/finance-ui.types';
import {
  formatGoalLimitInput,
  parseGoalLimitInput,
  validateGoalLimitInput,
} from '../utils/parse-goal-limit';
import { GoalAverageHint } from './goal-average-hint';

type EditSpendingGoalFormProps = {
  goal: SpendingGoalUi;
  average: number | null;
  onSaved: () => void;
  onCancel: () => void;
};

// Changes only the value: the category of a goal is fixed (remove and create
// another goal to switch categories).
export function EditSpendingGoalForm({
  goal,
  average,
  onSaved,
  onCancel,
}: EditSpendingGoalFormProps) {
  const [limitInput, setLimitInput] = useState(formatGoalLimitInput(goal.limit));
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
    const response = await setCategoryMonthlyLimit(goal.categoryId, limit);
    setIsSaving(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    onSaved();
  }

  return (
    <form className='space-y-3' onSubmit={handleSubmit} noValidate>
      <div className='max-w-xs space-y-1.5'>
        <Input
          id={`goal-limit-${goal.categoryId}`}
          label={`Novo limite de ${goal.categoryName}`}
          type='text'
          inputMode='decimal'
          value={limitInput}
          onChange={(event) => setLimitInput(event.target.value)}
        />
        <GoalAverageHint average={average} />
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
