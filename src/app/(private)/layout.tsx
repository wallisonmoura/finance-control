import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { ReactNode } from 'react';

type PrivateLayoutProps = {
  children: ReactNode;
};

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className='min-h-screen bg-zinc-50'>
      <header className='border-b bg-white px-4 py-3'>
        <div className='mx-auto flex max-w-5xl items-center justify-between'>
          <span className='text-sm font-semibold text-zinc-900'>
            Finance Control
          </span>

          <CurrentUserMenu />
        </div>
      </header>

      <main className='mx-auto max-w-5xl px-4 py-6'>{children}</main>
    </div>
  );
}
