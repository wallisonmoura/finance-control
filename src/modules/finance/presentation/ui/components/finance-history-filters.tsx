'use client';

import { SyntheticEvent, useState } from 'react';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { Button } from '@/shared/presentation/ui/components/button';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  ExpenseCategoryUi,
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';
import { Funnel } from 'lucide-react';

type FinanceHistoryFiltersProps = {
  filters: FinanceHistoryFiltersUi;
  categories: ExpenseCategoryUi[];
  isLoading?: boolean;
  onApplyFilters: (filters: FinanceHistoryFiltersUi) => void | Promise<void>;
};

type TypeFilterOption = 'ALL' | FinanceEntryTypeUi;

const ALL_CATEGORIES = 'ALL';

export function FinanceHistoryFilters({
  filters,
  categories,
  isLoading = false,
  onApplyFilters,
}: FinanceHistoryFiltersProps) {
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const [type, setType] = useState<TypeFilterOption>(filters.type ?? 'ALL');
  const [categoryId, setCategoryId] = useState<string>(
    filters.categoryId ?? ALL_CATEGORIES,
  );

  const isCategoryEnabled = type === 'EXPENSE';

  function handleTypeChange(nextType: TypeFilterOption) {
    setType(nextType);

    if (nextType !== 'EXPENSE') {
      setCategoryId(ALL_CATEGORIES);
    }
  }

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    await onApplyFilters({
      startDate,
      endDate,
      type: type === 'ALL' ? undefined : type,
      ...(isCategoryEnabled && categoryId !== ALL_CATEGORIES
        ? { categoryId }
        : {}),
    });
  }

  return (
    <Card className='p-5'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid gap-4 lg:grid-cols-2 lg:items-end xl:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]'>
          <Input
            id='finance-history-start-date'
            name='startDate'
            label='Data inicial'
            type='date'
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            required
          />

          <Input
            id='finance-history-end-date'
            name='endDate'
            label='Data final'
            type='date'
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            required
          />

          <SelectField
            id='finance-history-type'
            name='type'
            label='Tipo'
            value={type}
            onChange={(event) =>
              handleTypeChange(event.target.value as TypeFilterOption)
            }
            disabled={isLoading}
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
            ]}
          />

          <SelectField
            id='finance-history-category'
            name='categoryId'
            label='Categoria'
            value={isCategoryEnabled ? categoryId : ALL_CATEGORIES}
            onChange={(event) => setCategoryId(event.target.value)}
            disabled={isLoading || !isCategoryEnabled}
            options={[
              { label: 'Todas as categorias', value: ALL_CATEGORIES },
              ...categories.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
          />

          <Button
            type='submit'
            disabled={isLoading}
            variant='custom'
            className='h-11 w-full bg-primary px-5 text-base text-primary-foreground hover:bg-primary/90 xl:w-auto'
          >
            <Funnel aria-hidden='true' className='size-4' />
            {isLoading ? 'Aplicando...' : 'Aplicar filtros'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
