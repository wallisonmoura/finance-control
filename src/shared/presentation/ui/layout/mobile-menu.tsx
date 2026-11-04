'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

import { Button } from '@/shared/presentation/ui/components/button';
import { ThemeToggle } from '@/shared/presentation/ui/components/theme-toggle';

import { NavigationLink } from './navigation-link';
import { PRIVATE_NAVIGATION_ITEMS } from './navigation-items';
import { isNavigationItemActive } from './is-navigation-item-active';

// The slots come from other modules (the layout builds them), so shared
// does not depend on auth or debts.
type MobileMenuProps = {
  pathname: string;
  // Always visible, next to the theme toggle (e.g. the debts bell).
  barSlot?: ReactNode;
  // Top of the open menu (e.g. the current user).
  userSlot?: ReactNode;
  // Bottom of the open menu (e.g. sign out).
  footerSlot?: ReactNode;
};

export function MobileMenu({
  pathname,
  barSlot,
  userSlot,
  footerSlot,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function toggleMenu() {
    setIsOpen((current) => !current);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className='sticky top-0 z-30 border-b border-border bg-card md:hidden'
    >
      <div className='flex items-center justify-between px-4 py-4'>
        <div className='flex items-center gap-2'>
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

          <ThemeToggle />

          {barSlot}
        </div>

        <div className='relative h-11 w-40 overflow-hidden'>
          <Image
            src='/images/logo-finance-control-light.png'
            alt='Finance Control'
            fill
            priority
            sizes='160px'
            className='object-contain object-right dark:hidden'
          />
          <Image
            src='/images/logo-finance-control-dark.png'
            alt='Finance Control'
            fill
            priority
            sizes='160px'
            className='hidden object-contain object-right dark:block'
          />
        </div>
      </div>

      {isOpen && (
        <div className='border-t border-border bg-card shadow-lg shadow-border/60'>
          {userSlot && (
            <div className='border-b border-border bg-background px-4 py-3'>
              {userSlot}
            </div>
          )}

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

          {footerSlot && (
            <div className='border-t border-border bg-background px-4 py-3'>
              {footerSlot}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
