'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Standard next-themes "mounted" guard: resolvedTheme is always
    // undefined during SSR and the first client render (avoids the
    // classic FOUC), so this is the only way to know it's now safe to
    // read the real theme. Not derivable from props/state — it truly
    // needs an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';

  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='relative inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-card px-0 text-foreground shadow-sm ring-1 ring-border transition-all hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-ring/50'
    >
      {isDark ? (
        <Sun aria-hidden='true' className='size-5' />
      ) : (
        <Moon aria-hidden='true' className='size-5' />
      )}
    </button>
  );
}
