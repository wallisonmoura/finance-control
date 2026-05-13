import { Card } from '@/shared/presentation/ui/components/card';
import { FinanceEntryUi } from '../types/finance-ui.types';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';

type FinanceHistoryListProps = {
  entries: FinanceEntryUi[];
};

function formatEntryDate(date: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(date));
}

export function FinanceHistoryList({ entries }: FinanceHistoryListProps) {
  if (entries.length === 0) {
    return (
      <Card>
        <p className='text-sm text-slate-500'>
          Nenhum lançamento encontrado para o período selecionado.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className='space-y-4'>
        <div>
          <h2 className='text-lg text-black font-semibold'>Histórico</h2>
          <p className='text-sm text-slate-500'>
            Receitas e despesas realizadas no período.
          </p>
        </div>

        <ul className='divide-y divide-slate-200'>
          {entries.map((entry) => (
            <li
              key={entry.id}
              className='flex items-start justify-between gap-4 py-3'
            >
              <div className='min-w-0'>
                <p className='truncate font-medium text-slate-900'>
                  {entry.description}
                </p>

                <p className='text-sm text-slate-500'>
                  {entry.type === 'INCOME' ? 'Receita' : 'Despesa'} ·{' '}
                  {formatEntryDate(entry.date)}
                </p>

                {entry.notes && (
                  <p className='mt-1 text-sm text-slate-500'>{entry.notes}</p>
                )}
              </div>

              <div className='shrink-0 text-right'>
                <MoneyDisplay value={entry.amount} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
