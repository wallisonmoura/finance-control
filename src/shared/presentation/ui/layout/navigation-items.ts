import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  ChartNoAxesCombined,
  CircleDollarSign,
  LayoutDashboard,
  WalletCards,
} from 'lucide-react';

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const PRIVATE_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Painel',
    href: '/',
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
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3,
  },
];
