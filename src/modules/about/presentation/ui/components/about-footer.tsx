import Link from 'next/link';

import { Button } from '@/shared/presentation/ui/components/button';

export function AboutFooter() {
  return (
    <footer className='bg-primary text-primary-foreground'>
      <div className='mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center'>
        <p className='text-xl font-semibold'>
          Pronto pra saber quanto você realmente tem?
        </p>

        <Button asChild variant='secondary' className='h-11 px-8'>
          <Link href='/login'>Entrar</Link>
        </Button>

        <div className='flex items-center gap-4 text-xs text-primary-foreground/70'>
          <span>Privacidade</span>
          <span aria-hidden='true'>•</span>
          <span>Termos de Uso</span>
          <span aria-hidden='true'>•</span>
          <span>Suporte</span>
        </div>
      </div>
    </footer>
  );
}
