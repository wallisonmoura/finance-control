'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';

import { NavigationLink } from './navigation-link';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { isNavigationItemActive } from './is-navigation-item-active';

type MobileMenuProps = {
  pathname: string;
};

export function MobileMenu({ pathname }: MobileMenuProps) {
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
        <div>
          <p className='text-base font-bold text-foreground'>Finance Control</p>
          <p className='text-xs text-muted-foreground'>Controle financeiro</p>
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
        <nav
          id='mobile-navigation'
          aria-label='Navegação principal mobile'
          className='space-y-1 border-t border-border bg-sidebar px-4 py-3 shadow-lg shadow-slate-200/60'
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
      )}
    </div>
  );
}
