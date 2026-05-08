'use client';

import { useState } from 'react';

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
    <div className='border-b border-slate-200 bg-white md:hidden'>
      <div className='flex items-center justify-between px-4 py-4'>
        <div>
          <p className='text-base font-bold text-slate-900'>Finance Control</p>
          <p className='text-xs text-slate-500'>Controle financeiro</p>
        </div>

        <button
          type='button'
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls='mobile-navigation'
          className='rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700'
        >
          Menu
        </button>
      </div>

      {isOpen && (
        <nav
          id='mobile-navigation'
          aria-label='Navegação principal mobile'
          className='space-y-1 border-t border-slate-200 px-4 py-3'
        >
          {PRIVATE_NAVIGATION_ITEMS.map((item) => (
            <NavigationLink
              key={item.href}
              href={item.href}
              label={item.label}
              isActive={isNavigationItemActive(pathname, item.href)}
              onClick={closeMenu}
            />
          ))}
        </nav>
      )}
    </div>
  );
}
