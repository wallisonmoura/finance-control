import type { Metadata } from 'next';
import { getCurrentUserDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { PaidDebtsPageContent } from '@/modules/debts/presentation/ui/components/paid-debts-page-content';

export const metadata: Metadata = {
  title: 'Dívidas pagas',
};

export default async function PaidDebtsPage() {
  const { data, error } = await getCurrentUserDebts();

  return <PaidDebtsPageContent debts={data ?? []} error={error} />;
}
