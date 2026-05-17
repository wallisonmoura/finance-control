import Link from 'next/link';

export function FinanceBackLink() {
  return (
    <Link
      href='/finance'
      className='inline-flex text-sm font-medium text-slate-600 transition hover:text-slate-950'
    >
      Voltar para financeiro
    </Link>
  );
}
