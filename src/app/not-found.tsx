import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';

export default function NotFound() {
  return (
    <div className='flex min-h-dvh items-center justify-center bg-background px-4 py-12'>
      <div className='w-full max-w-sm text-center'>
        <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-info-muted'>
          <SearchX aria-hidden='true' className='size-6 text-info' />
        </div>

        <h1 className='mt-6 text-2xl font-bold tracking-tight text-foreground'>
          Página não encontrada
        </h1>

        <p className='mt-2 text-sm leading-6 text-muted-foreground'>
          O endereço que você tentou acessar não existe ou foi movido.
        </p>

        <div className='mt-6'>
          <Button asChild>
            <Link href='/'>
              <Home aria-hidden='true' className='size-4' />
              Voltar para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
