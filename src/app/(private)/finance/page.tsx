import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default function FinancePage() {
  return (
    <div className='space-y-4'>
      <PageTitle
        title='Finance'
        description='Gerencie receitas, despesas e histórico operacional.'
      />
    </div>
  );
}
