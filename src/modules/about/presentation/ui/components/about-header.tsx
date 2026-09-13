import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/shared/presentation/ui/components/button';

export function AboutHeader() {
  return (
    <header className='border-b border-border bg-background'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-4'>
        <div className='relative h-9 w-44'>
          <Image
            src='/images/logo-finance-control-light.png'
            alt='Finance Control'
            fill
            priority
            sizes='176px'
            className='object-contain object-left dark:hidden'
          />
          <Image
            src='/images/logo-finance-control-dark.png'
            alt='Finance Control'
            fill
            priority
            sizes='176px'
            className='hidden object-contain object-left dark:block'
          />
        </div>

        <Button asChild variant='secondary' className='h-10 px-6'>
          <Link href='/login'>Entrar</Link>
        </Button>
      </div>
    </header>
  );
}
