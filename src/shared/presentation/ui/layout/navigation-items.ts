import type { LucideIcon } from 'lucide-react';
import { ChartNoAxesCombined, CircleDollarSign, LayoutDashboard, WalletCards } from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PRIVATE_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Painel',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Carteira',
    href: '/wallet',
    icon: WalletCards,
  },
  {
    label: 'Financeiro',
    href: '/finance',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Dívidas',
    href: '/debts',
    icon: CircleDollarSign,
  },
];
