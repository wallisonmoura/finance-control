import type { Metadata } from 'next';
import { getCurrentUserWallet } from '@/modules/wallet/presentation/server/get-current-user-wallet';
import { WalletPageContent } from '@/modules/wallet/presentation/ui/components/wallet-page-content';

export const metadata: Metadata = {
  title: 'Carteira',
};

export default async function WalletPage() {
  const { data, error } = await getCurrentUserWallet();

  return <WalletPageContent initialWallet={data} initialError={error} />;
}
