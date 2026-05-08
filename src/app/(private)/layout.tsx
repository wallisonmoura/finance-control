import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { PrivateNavigation } from '@/shared/presentation/ui/layout/private-navigation';
import { ReactNode } from 'react';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className='min-h-screen bg-slate-50 md:flex'>
      <PrivateNavigation />

      <div className='flex min-h-screen flex-1 flex-col'>
        <header className='hidden border-b border-slate-200 bg-white px-6 py-4 md:block'>
          <div className='flex items-center justify-end'>
            <CurrentUserMenu />
          </div>
        </header>

        <div className='border-b border-slate-200 bg-white px-4 py-3 md:hidden'>
          <CurrentUserMenu />
        </div>

        <main className='flex-1 px-4 py-6 md:px-8'>{children}</main>
      </div>
    </div>
  );
}
