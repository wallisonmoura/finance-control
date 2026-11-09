import type { ReactNode } from 'react';
import Image from 'next/image';

type AuthPageShellProps = {
  children: ReactNode;
};

// The public auth layout: side image on large screens, logo on small ones and
// the footer. Same markup as the login and register screens.
export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className='min-h-screen bg-card lg:h-dvh lg:min-h-0 lg:overflow-hidden'>
      <div className='grid min-h-screen w-full bg-card lg:h-full lg:min-h-0 lg:grid-cols-2'>
        <aside className='relative hidden h-full overflow-hidden bg-hero lg:block'>
          <Image src='/images/auth-bg.png' alt='' fill priority sizes='50vw' className='object-fill' />
        </aside>

        <section className='relative flex min-h-screen flex-col bg-card px-6 py-8 lg:h-dvh lg:min-h-0 lg:px-16 lg:py-0'>
          <div className='mx-auto flex w-full max-w-md flex-1 flex-col justify-center lg:h-full lg:flex-none lg:py-12 lg:pb-20'>
            <div className='mb-8 flex justify-center lg:hidden'>
              <Image
                src='/images/logo-finance-control-auth.png'
                alt='Finance Control'
                width={180}
                height={120}
                priority
                className='h-auto w-36 object-contain'
              />
            </div>

            {children}
          </div>

          <footer className='mx-auto mt-8 hidden w-full max-w-md items-center justify-center gap-5 border-t border-border pt-6 text-xs text-muted-foreground sm:flex lg:absolute lg:bottom-8 lg:left-16 lg:right-16 lg:mx-0 lg:mt-0 lg:max-w-none lg:pt-5'>
            <span>Privacidade</span>
            <span aria-hidden='true'>•</span>
            <span>Termos de Uso</span>
            <span aria-hidden='true'>•</span>
            <span>Suporte</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
