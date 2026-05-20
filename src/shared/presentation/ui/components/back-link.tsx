import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type BackLinkProps = {
  href: string;
  children: string;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link
      href={href}
      className='inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950'
    >
      <ArrowLeft aria-hidden='true' className='size-4' />
      {children}
    </Link>
  );
}
