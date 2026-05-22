import { getCurrentUserPendingDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { PendingDebtsPageContent } from '@/modules/debts/presentation/ui/components/pending-debts-page-content';

export default async function PendingDebtsPage() {
  const { data, error } = await getCurrentUserPendingDebts();

  return <PendingDebtsPageContent initialDebts={data} initialError={error} />;
}
