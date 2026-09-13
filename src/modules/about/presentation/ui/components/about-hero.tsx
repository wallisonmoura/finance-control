import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/presentation/ui/components/button';

export function AboutHero() {
  return (
    <section className='bg-background'>
      <div className='mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16 lg:py-24'>
        <div>
          <p className='text-sm font-semibold text-income'>Finance Control</p>
          <h1 className='mt-3 text-4xl font-bold tracking-tight text-balance text-foreground sm:text-5xl'>
            Seu dinheiro, seu controle, seu futuro.
          </h1>
          <p className='mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground'>
            Carteira, receitas, despesas, dívidas e relatórios num só lugar —
            sem planilha, sem letra miúda.
          </p>

          <div className='mt-8'>
            <Button asChild className='h-12 px-8 text-base'>
              <Link href='/login'>Entrar</Link>
            </Button>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-border/60'>
          <Image
            src='/images/about/painel.png'
            alt='Painel do Finance Control mostrando saldo final, composição da carteira e transações recentes'
            width={1440}
            height={900}
            priority
            className='h-auto w-full'
          />
        </div>
      </div>
    </section>
  );
}
