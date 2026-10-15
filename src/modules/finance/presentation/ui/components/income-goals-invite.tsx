'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export const INCOME_GOALS_INVITE_DISMISSED_KEY = 'fc:income-goals-invite-dismissed';

const GOALS_HREF = '/relatorios/metas';

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(INCOME_GOALS_INVITE_DISMISSED_KEY) === '1';
  } catch {
    // Storage blocked (private window, site data off): just show the invite.
    return false;
  }
}

function saveDismissed() {
  try {
    window.localStorage.setItem(INCOME_GOALS_INVITE_DISMISSED_KEY, '1');
  } catch {
    // Not remembered in this browser; it hides until the next visit.
  }
}

// Shown on the Painel when the user has no income goal. Not everyone wants
// goals, so "Agora não" hides it in this browser; the goals stay one click away
// in Relatórios → Metas. A per-browser convenience, so localStorage is enough.
export function IncomeGoalsInvite() {
  // Unknown until mounted (localStorage only exists in the browser): render
  // nothing on the server and first paint, so a dismissed invite never flashes.
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(!readDismissed());
  }, []);

  function dismiss() {
    saveDismissed();
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-dashed border-border px-4 py-3'>
      <p className='text-sm text-muted-foreground'>
        Defina metas de faturamento e lucro pra acompanhar o mês aqui.
      </p>
      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={dismiss}
          className='rounded-sm text-sm text-muted-foreground hover:text-foreground'
        >
          Agora não
        </button>
        <Link href={GOALS_HREF} className='text-sm font-semibold text-income hover:underline'>
          Definir metas
        </Link>
      </div>
    </div>
  );
}
