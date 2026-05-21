'use client';

import { SyntheticEvent, useState } from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { Button } from '@/shared/presentation/ui/components/button';
import { SelectField } from '@/shared/presentation/ui/components/select-field';

import {
  FinanceEntryTypeUi,
  FinanceHistoryFiltersUi,
} from '../types/finance-ui.types';

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
    <Card>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <h2 className='text-lg font-semibold text-zinc-900'>
            Filtros do histórico
          </h2>
          <p className='mt-1 text-sm text-zinc-600'>
            Consulte receitas e despesas por período.
          </p>
        </div>

        <div className='grid gap-4 md:grid-cols-3'>
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
            onChange={(event) => setType(event.target.value as TypeFilterOption)}
            disabled={isLoading}
            options={[
              { label: 'Todos', value: 'ALL' },
              { label: 'Receitas', value: 'INCOME' },
              { label: 'Despesas', value: 'EXPENSE' },
            ]}
          />
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            <Search aria-hidden='true' className='size-4' />
            {isLoading ? 'Aplicando...' : 'Aplicar filtros'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
