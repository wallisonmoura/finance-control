'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/presentation/ui/components/button';
import { Card } from '@/shared/presentation/ui/components/card';
import { FormErrorMessage } from '@/shared/presentation/ui/components/form-error-message';
import { Input } from '@/shared/presentation/ui/components/input';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import { setCategoryMonthlyLimit } from '../services/finance-api.service';
import { SpendingGoalCategoryOptionUi } from '../types/finance-ui.types';
import { parseGoalLimitInput } from '../utils/parse-goal-limit';
import { GoalAverageHint } from './goal-average-hint';

type NewSpendingGoalFormProps = {
  categories: SpendingGoalCategoryOptionUi[];
  onSaved: () => void;
  onCancel: () => void;
};

export function NewSpendingGoalForm({
  categories,
  onSaved,
  onCancel,
}: NewSpendingGoalFormProps) {
  const [categoryId, setCategoryId] = useState('');
  const [limitInput, setLimitInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedCategory = categories.find((category) => category.id === categoryId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setError('Selecione uma categoria.');
      return;
    }

    const limit = parseGoalLimitInput(limitInput);

    if (!(limit > 0)) {
      setError('Informe um limite maior que zero.');
      return;
    }

    setError(null);
    setIsSaving(true);
    const response = await setCategoryMonthlyLimit(categoryId, limit);
    setIsSaving(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    onSaved();
  }

  return (
    <Card className='p-5'>
      <form className='space-y-4' onSubmit={handleSubmit} noValidate>
        <h2 className='text-base font-semibold text-foreground'>Nova meta</h2>

        <div className='grid gap-4 sm:grid-cols-2'>
          <SelectField
            id='goal-category'
            label='Categoria'
            value={categoryId}
            placeholder='Selecione uma categoria'
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
            onChange={(event) => setCategoryId(event.target.value)}
          />

          <div className='space-y-1.5'>
            <Input
              id='goal-limit'
              label='Limite mensal'
              type='text'
              inputMode='decimal'
              placeholder='0,00'
              value={limitInput}
              onChange={(event) => setLimitInput(event.target.value)}
            />
            <GoalAverageHint average={selectedCategory?.averageSpent} />
          </div>
        </div>

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
    </Card>
  );
}
