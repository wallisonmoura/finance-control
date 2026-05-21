import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';
import { ReactNode } from 'react';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className='min-h-dvh bg-background md:flex'>
      <PrivateNavigation />

      <div className='flex min-h-dvh min-w-0 flex-1 flex-col'>
        <header className='sticky top-0 z-20 hidden h-16 border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur md:block'>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-end'>
            <CurrentUserMenu />
          </div>
        </header>

        <div className='border-b border-slate-200 bg-white px-4 py-3 md:hidden'>
          <CurrentUserMenu />
        </div>

        <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-5 md:px-8 md:py-8 lg:px-10'>
          {children}
        </main>
      </div>
    </div>
  );
}
