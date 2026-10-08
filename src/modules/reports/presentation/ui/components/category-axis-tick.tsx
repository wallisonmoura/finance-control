'use client';

import { useState, type KeyboardEvent } from 'react';

type CategoryAxisTickProps = {
  // Injected by Recharts' YAxis `tick` prop.
  x?: number;
  y?: number;
  index?: number;
  payload?: { value: string };
  // Receives the position of the category in the chart data — not its name,
  // which may repeat (e.g. "Sem categoria").
  onSelect: (index: number) => void;
};

// Rough width of a 12px label, used only to size the focus ring (SVG text
// cannot be measured before layout in a portable way).
const CHARACTER_WIDTH = 6.6;

// Y-axis label of "Gastos por categoria" that opens the category history.
// Bars are mouse-only in Recharts, so the label is the keyboard path; it
// draws a visible focus ring because SVG text has no native focus outline.
export function CategoryAxisTick({
  x = 0,
  y = 0,
  index = 0,
  payload,
  onSelect,
}: CategoryAxisTickProps) {
  const [isFocused, setIsFocused] = useState(false);
  const name = payload?.value ?? '';
  const ringWidth = name.length * CHARACTER_WIDTH + 12;

  function handleKeyDown(event: KeyboardEvent<SVGTextElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      {isFocused && (
        <rect
          data-slot='tick-focus-ring'
          x={-ringWidth}
          y={-11}
          width={ringWidth}
          height={22}
          rx={4}
          fill='none'
          stroke='var(--ring)'
          strokeWidth={2}
        />
      )}
      <text
        role='link'
        tabIndex={0}
        aria-label={`Ver histórico de ${name}`}
        x={-6}
        y={0}
        dy={4}
        textAnchor='end'
        fontSize={12}
        fill='currentColor'
        className='cursor-pointer text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:text-foreground'
        onClick={() => onSelect(index)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {name}
      </text>
    </g>
  );
}
