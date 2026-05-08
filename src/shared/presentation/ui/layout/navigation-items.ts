export type NavigationItem = {
  label: string;
  href: string;
};

export const PRIVATE_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Wallet',
    href: '/wallet',
  },
  {
    label: 'Finance',
    href: '/finance',
  },
  {
    label: 'Dívidas',
    href: '/debts',
  },
];
