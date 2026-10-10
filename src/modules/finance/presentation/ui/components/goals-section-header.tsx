import type { ReactNode } from 'react';

type GoalsSectionHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

// Header of each section of the goals page ("Metas de ganho", "Metas de
// gasto"); the page itself owns the h1 ("Metas").
export function GoalsSectionHeader({ title, description, action }: GoalsSectionHeaderProps) {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
      <div>
        <h2 className='text-lg font-semibold text-foreground'>{title}</h2>
        <p className='mt-1 text-sm leading-6 text-muted-foreground'>{description}</p>
      </div>
      {action}
    </div>
  );
}
