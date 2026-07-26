import { Suspense } from 'react';

import { getCurrentUserDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { DebtsPageContent } from '@/modules/debts/presentation/ui/components/debts-page-content';
import { LoadingState } from '@/shared/presentation/ui/components/loading-state';

export default async function DebtsPage() {
  const { data, error } = await getCurrentUserDebts();

  return (
    <Suspense fallback={<LoadingState message='Carregando dívidas...' />}>
      <DebtsPageContent initialDebts={data} initialError={error} />
    </Suspense>
  );
}
