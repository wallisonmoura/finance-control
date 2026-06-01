'use client';

import { SyntheticEvent, useState } from 'react';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { Button } from '@/shared/presentation/ui/components/button';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';
import { Funnel } from 'lucide-react';

type FinanceHistoryFiltersProps = {
  filters: FinanceHistoryFiltersUi;
  isLoading?: boolean;
  onApplyFilters: (filters: FinanceHistoryFiltersUi) => void | Promise<void>;
};

type TypeFilterOption = 'ALL' | FinanceEntryTypeUi;

export function FinanceHistoryFilters({
  filters,
  isLoading = false,
  onApplyFilters,
}: FinanceHistoryFiltersProps) {
  const [startDate, setStartDate] = useState(filters.startDate);
  const [endDate, setEndDate] = useState(filters.endDate);
  const [type, setType] = useState<TypeFilterOption>(filters.type ?? 'ALL');

  async function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();

    await onApplyFilters({
      startDate,
      endDate,
      type: type === 'ALL' ? undefined : type,
    });
  }

  return (
    <Card className='p-5'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid gap-4 lg:grid-cols-2 lg:items-end xl:grid-cols-[1fr_1fr_0.8fr_auto]'>
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
              setType(event.target.value as TypeFilterOption)
            }
            disabled={isLoading}
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
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
