'use client';

import type { KeyboardEvent } from 'react';

type CategoryAxisTickProps = {
  // Injected by Recharts' YAxis `tick` prop.
  x?: number;
  y?: number;
  payload?: { value: string };
  onSelect: (categoryName: string) => void;
};

// Y-axis label of "Gastos por categoria" that opens the category history.
// Bars are mouse-only in Recharts, so the label is the keyboard path.
export function CategoryAxisTick({ x = 0, y = 0, payload, onSelect }: CategoryAxisTickProps) {
  const name = payload?.value ?? '';

  function handleKeyDown(event: KeyboardEvent<SVGTextElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(name);
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        role='link'
        tabIndex={0}
        aria-label={`Ver histórico de ${name}`}
        x={-4}
        y={0}
        dy={4}
        textAnchor='end'
        fontSize={12}
        fill='currentColor'
        className='cursor-pointer text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline'
        onClick={() => onSelect(name)}
        onKeyDown={handleKeyDown}
      >
        {name}
      </text>
    </g>
  );
}
