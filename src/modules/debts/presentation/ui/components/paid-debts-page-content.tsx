import { BackLink } from '@/shared/presentation/ui/components/back-link';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

import { DebtUi } from '../types/debt-ui.types';
import { DebtList } from './debt-list';

type PaidDebtsPageContentProps = {
  debts: DebtUi[];
  error?: string | null;
};

export function PaidDebtsPageContent({
  debts,
  error = null,
}: PaidDebtsPageContentProps) {
  const paidDebts = debts.filter((debt) => debt.status === 'PAID');

  return (
    <div className='space-y-6'>
      <BackLink href='/debts'>Voltar para dívidas</BackLink>

      <PageTitle
        title='Dívidas pagas'
        description='Consulte compromissos financeiros que já foram quitados.'
      />

      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!error && <DebtList debts={paidDebts} />}
    </div>
  );
}
