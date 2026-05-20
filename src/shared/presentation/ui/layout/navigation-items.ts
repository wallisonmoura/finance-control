import type { LucideIcon } from 'lucide-react';
import { ChartNoAxesCombined, CircleDollarSign, LayoutDashboard, WalletCards } from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PRIVATE_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Wallet',
    href: '/wallet',
    icon: WalletCards,
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: ChartNoAxesCombined,
  },
  {
    label: 'Dívidas',
    href: '/debts',
    icon: CircleDollarSign,
  },
];
