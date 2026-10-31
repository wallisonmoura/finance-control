'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { setIncomeGoals } from '../services/finance-api.service';
import { IncomeGoalTargetsUi } from '../types/finance-ui.types';
import { IncomeGoalKind } from '../utils/format-income-goal';
import {
  formatGoalLimitInput,
  parseGoalLimitInput,
  validateGoalLimitInput,
} from '../utils/parse-goal-limit';
import { GoalAverageHint } from './goal-average-hint';

const FIELD: Record<IncomeGoalKind, { id: string; label: string; key: keyof IncomeGoalTargetsUi }> = {
  revenue: { id: 'edit-income-goal-revenue', label: 'Faturamento mensal', key: 'revenueTarget' },
  profit: { id: 'edit-income-goal-profit', label: 'Lucro mensal', key: 'profitTarget' },
};

type EditIncomeGoalFormProps = {
  measure: IncomeGoalKind;
  // Both targets: the API saves them together, so the other one is resent as is.
  targets: IncomeGoalTargetsUi;
  average: number | null;
  averageLabel?: string;
  onSaved: (targets: IncomeGoalTargetsUi) => void;
  onCancel: () => void;
};

// Defines or edits one income goal (revenue or profit) on its history page.
// An empty field removes that goal, like the form on /relatorios/metas.
export function EditIncomeGoalForm({
  measure,
  targets,
  average,
  averageLabel,
  onSaved,
  onCancel,
}: EditIncomeGoalFormProps) {
  const field = FIELD[measure];
  const current = targets[field.key];
  const [value, setValue] = useState(current === null ? '' : formatGoalLimitInput(current));
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Input does not forward refs: focus by id, like income-goals-form.tsx.
  useEffect(() => {
    document.getElementById(field.id)?.focus();
  }, [field.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = value.trim();
    const nextFieldError = trimmed
      ? validateGoalLimitInput(trimmed, 'Informe um valor maior que zero.')
      : null;

    setFieldError(nextFieldError);

    if (nextFieldError) {
      document.getElementById(field.id)?.focus();
      return;
    }

    const nextTargets: IncomeGoalTargetsUi = {
      ...targets,
      [field.key]: trimmed ? parseGoalLimitInput(trimmed) : null,
    };

    setError(null);
    setIsSaving(true);
    const response = await setIncomeGoals(nextTargets);
    setIsSaving(false);

    if (response.error || !response.data) {
      setError(response.error ?? 'Não foi possível salvar a meta.');
      return;
    }

    // What the server stored is the source of truth (the other goal may have
    // changed in another tab), not the values this form sent.
    onSaved(response.data);
  }

  return (
    <form className='space-y-4' onSubmit={handleSubmit} noValidate>
      <div className='max-w-sm space-y-1.5'>
        <Input
          aria-invalid={fieldError ? true : undefined}
          aria-describedby={fieldError ? `${field.id}-error` : undefined}
          id={field.id}
          label={field.label}
          type='text'
          inputMode='decimal'
          placeholder='Sem meta'
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {fieldError ? (
          <p id={`${field.id}-error`} className='text-xs font-medium text-destructive'>
            {fieldError}
          </p>
        ) : null}
        <GoalAverageHint average={average} label={averageLabel} />
      </div>

      <p className='text-xs text-muted-foreground'>Deixe vazio para ficar sem essa meta.</p>

      <FormErrorMessage message={error} />

      <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
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
