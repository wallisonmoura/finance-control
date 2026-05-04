import { Card } from '@/shared/presentation/ui/components/card';
import { MoneyDisplay } from '@/shared/presentation/ui/components/money-display';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default function DashboardPage() {
  return (
    <div className='space-y-4'>
      <PageTitle
        title='Dashboard'
        description='Resumo inicial da sua posição financeira.'
      />

      <Card>
        <span className='text-sm text-slate-500'>Wallet Total</span>
        <MoneyDisplay value={0} className='mt-2' />
      </Card>

      <Card>
        <span className='text-sm text-slate-500'>Dívidas pendentes</span>
        <MoneyDisplay value={0} className='mt-2' />
      </Card>

      <Card>
        <span className='text-sm text-slate-500'>Saldo final</span>
        <MoneyDisplay value={0} className='mt-2' />
      </Card>
    </div>
  );
}
