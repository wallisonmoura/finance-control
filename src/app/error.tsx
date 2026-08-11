'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RotateCw, TriangleAlert } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className='flex min-h-dvh items-center justify-center bg-background px-4 py-12'>
      <div className='w-full max-w-sm text-center'>
        <div className='mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10'>
          <TriangleAlert
            aria-hidden='true'
            className='size-6 text-destructive'
          />
        </div>

        <h1 className='mt-6 text-2xl font-bold tracking-tight text-foreground'>
          Algo deu errado
        </h1>

        <p className='mt-2 text-sm leading-6 text-muted-foreground'>
          Não conseguimos carregar esta página. Tente novamente ou volte para
          o início.
        </p>

        {error.digest ? (
          <p className='mt-3 font-mono text-xs text-muted-foreground/70'>
            Código: {error.digest}
          </p>
        ) : null}

        <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center'>
          <Button type='button' onClick={reset}>
            <RotateCw aria-hidden='true' className='size-4' />
            Tentar novamente
          </Button>

          <Button asChild variant='secondary'>
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
