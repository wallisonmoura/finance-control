'use client';

import { SyntheticEvent, useState } from 'react';
import { Card } from '@/shared/presentation/ui/components/card';
import { Input } from '@/shared/presentation/ui/components/input';
import { Button } from '@/shared/presentation/ui/components/button';

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

          <div className='space-y-1'>
            <label
              htmlFor='finance-history-type'
              className='text-sm font-medium text-zinc-700'
            >
              Tipo
            </label>

            <select
              id='finance-history-type'
              name='type'
              value={type}
              onChange={(event) =>
                setType(event.target.value as TypeFilterOption)
              }
              className='flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={isLoading}
            >
              <option value='ALL'>Todos</option>
              <option value='INCOME'>Receitas</option>
              <option value='EXPENSE'>Despesas</option>
            </select>
          </div>
        </div>

        <div className='flex justify-end'>
          <Button type='submit' disabled={isLoading}>
            {isLoading ? 'Aplicando...' : 'Aplicar filtros'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
