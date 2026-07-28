import { ReactNode } from 'react';

type RouteLoadingRegionProps = {
  children: ReactNode;
};

export function RouteLoadingRegion({ children }: RouteLoadingRegionProps) {
  return (
    <div
      role='status'
      aria-live='polite'
      aria-label='Carregando conteúdo'
      className='space-y-6'
    >
      {children}
    </div>
  );
}
