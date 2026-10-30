import type { Metadata } from 'next';
import { getCurrentUserDebts } from '@/modules/debts/presentation/server/get-current-user-debts';
import { PaidDebtsPageContent } from '@/modules/debts/presentation/ui/components/paid-debts-page-content';

export const metadata: Metadata = {
  title: 'Dívidas pagas',
};

export default async function PaidDebtsPage() {
  const { data, error } = await getCurrentUserDebts();
  // Decided per request; a page left open past 24h gets the API's 409.
  // Server Component rendered once per request, so reading the clock here is
  // safe (the purity rule targets client re-renders).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  return <PaidDebtsPageContent debts={data ?? []} error={error} now={now} />;
}
