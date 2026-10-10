'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';


import { Button } from '@/shared/presentation/ui/components/button';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';

import { setIncomeGoals } from '../services/finance-api.service';
import { IncomeGoalTargetsUi } from '../types/finance-ui.types';
import {
  formatGoalLimitInput,
  parseGoalLimitInput,
  validateGoalLimitInput,
} from '../utils/parse-goal-limit';
import { GoalAverageHint } from './goal-average-hint';

type IncomeGoalsFormProps = {
  initial: IncomeGoalTargetsUi;
  averages: { revenue: number | null; profit: number | null };
  onSaved: () => void;
  onCancel: () => void;
};

type FieldKey = 'revenueTarget' | 'profitTarget';

const FIELDS = [
  { key: 'revenueTarget', averageKey: 'revenue', id: 'income-goal-revenue', label: 'Faturamento mensal' },
  { key: 'profitTarget', averageKey: 'profit', id: 'income-goal-profit', label: 'Lucro mensal' },
] as const;

function toInput(value: number | null): string {
  return value === null ? '' : formatGoalLimitInput(value);
}

// Both targets are saved together; an empty field means "no goal".
export function IncomeGoalsForm({ initial, averages, onSaved, onCancel }: IncomeGoalsFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [inputs, setInputs] = useState({
    revenueTarget: toInput(initial.revenueTarget),
    profitTarget: toInput(initial.profitTarget),
  });
  // Field errors are tied to their input (aria-invalid + aria-describedby);
  // `error` is kept for API errors, which belong to the whole form.
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Keyboard users land on the first field as soon as the form opens.
  useEffect(() => {
    formRef.current?.querySelector('input')?.focus();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextFieldErrors: Partial<Record<FieldKey, string>> = {};

    for (const field of FIELDS) {
      const value = inputs[field.key].trim();
      const fieldError = value
        ? validateGoalLimitInput(value, 'Informe um valor maior que zero.')
        : null;

      if (fieldError) {
        nextFieldErrors[field.key] = fieldError;
      }
    }

    setFieldErrors(nextFieldErrors);

    const firstInvalid = FIELDS.find((field) => nextFieldErrors[field.key]);
    if (firstInvalid) {
      // Send keyboard and screen reader users straight to what needs fixing.
      document.getElementById(firstInvalid.id)?.focus();
      return;
    }

    const targets: IncomeGoalTargetsUi = {
      revenueTarget: inputs.revenueTarget.trim() ? parseGoalLimitInput(inputs.revenueTarget) : null,
      profitTarget: inputs.profitTarget.trim() ? parseGoalLimitInput(inputs.profitTarget) : null,
    };

    setError(null);
    setIsSaving(true);
    const response = await setIncomeGoals(targets);
    setIsSaving(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    onSaved();
  }

  return (
    <form ref={formRef} className='space-y-4' onSubmit={handleSubmit} noValidate>
      <div className='grid gap-4 sm:grid-cols-2'>
        {FIELDS.map((field) => (
          <div key={field.key} className='space-y-1.5'>
            <Input
              aria-invalid={fieldErrors[field.key] ? true : undefined}
              aria-describedby={fieldErrors[field.key] ? `${field.id}-error` : undefined}
              id={field.id}
              label={field.label}
              type='text'
              inputMode='decimal'
              placeholder='Sem meta'
              value={inputs[field.key]}
              onChange={(event) =>
                setInputs((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
            {fieldErrors[field.key] ? (
              <p id={`${field.id}-error`} className='text-xs font-medium text-destructive'>
                {fieldErrors[field.key]}
              </p>
            ) : null}
            <GoalAverageHint average={averages[field.averageKey]} />
          </div>
        ))}
      </div>

      <p className='text-xs text-muted-foreground'>Deixe um campo vazio para ficar sem essa meta.</p>

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
