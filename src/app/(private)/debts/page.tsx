import { getCurrentUserDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { DebtsPageContent } from '@/modules/debts/presentation/ui/components/debts-page-content';

export default async function DebtsPage() {
  const { data, error } = await getCurrentUserDebts();

  return <DebtsPageContent initialDebts={data} initialError={error} />;
}
