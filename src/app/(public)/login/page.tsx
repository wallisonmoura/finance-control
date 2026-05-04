import { Card } from '@/shared/presentation/ui/components/card';
import { PageTitle } from '@/shared/presentation/ui/components/page-title';

export default function LoginPage() {
  return (
    <Card className='w-full'>
      <PageTitle
        title='Finance Control'
        description='Acesse sua área financeira.'
      />

      <div className='mt-6 rounded-xl bg-slate-100 p-4 text-sm text-slate-600'>
        Formulário de login será implementado na próxima fase.
      </div>
    </Card>
  );
}
