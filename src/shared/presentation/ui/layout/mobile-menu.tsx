'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import { CurrentUserMenu } from '@/modules/auth/presentation/ui/components/current-user-menu';
import { SignOutButton } from '@/modules/auth/presentation/ui/components/sign-out-button';
import { AuthenticatedUser } from '@/modules/auth/presentation/ui/types/auth-ui.types';
import { Button } from '@/shared/presentation/ui/components/button';

import { NavigationLink } from './navigation-link';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { isNavigationItemActive } from './is-navigation-item-active';

type MobileMenuProps = {
  pathname: string;
  currentUser?: AuthenticatedUser | null;
  currentUserError?: string | null;
};

export function MobileMenu({
  pathname,
  currentUser = null,
  currentUserError = null,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleMenu() {
    setIsOpen((current) => !current);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className='sticky top-0 z-30 border-b border-border bg-card md:hidden'>
      <div className='flex items-center justify-between px-4 py-4'>
        <div className='relative h-11 w-40 overflow-hidden'>
          <Image
            src='/images/logo-finance-control-horizontal.png'
            alt='Finance Control'
            fill
            priority
            sizes='160px'
            className='scale-110 object-contain object-left'
          />
        </div>

        <Button
          type='button'
          onClick={toggleMenu}
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isOpen}
          aria-controls='mobile-navigation'
          variant='secondary'
          className='size-10 px-0'
        >
          {isOpen ? (
            <X aria-hidden='true' className='size-5' />
          ) : (
            <Menu aria-hidden='true' className='size-5' />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className='border-t border-border bg-card shadow-lg shadow-slate-200/60'>
          <div className='border-b border-border bg-slate-50 px-4 py-3'>
            <CurrentUserMenu
              initialUser={currentUser}
              initialError={currentUserError}
              showSignOut={false}
            />
          </div>

          <nav
            id='mobile-navigation'
            aria-label='Navegação principal mobile'
            className='space-y-2 px-4 py-3'
          >
            {PRIVATE_NAVIGATION_ITEMS.map((item) => (
              <NavigationLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isNavigationItemActive(pathname, item.href)}
                onClick={closeMenu}
              />
            ))}
          </nav>

          <div className='border-t border-border bg-slate-50 px-4 py-3'>
            <SignOutButton />
          </div>
        </div>
      )}
    </div>
  );
}
