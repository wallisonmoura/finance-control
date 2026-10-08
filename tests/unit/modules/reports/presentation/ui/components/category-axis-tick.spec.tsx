import { fireEvent, render, screen } from '@testing-library/react';

import { CategoryAxisTick } from '@/modules/reports/presentation/ui/components/category-axis-tick';

function renderTick(onSelect = jest.fn()) {
  render(
    <svg>
      <CategoryAxisTick x={140} y={20} payload={{ value: 'Combustível' }} onSelect={onSelect} />
    </svg>,
  );

  return onSelect;
}

describe('CategoryAxisTick', () => {
  it('should render the category name as a focusable link', () => {
    renderTick();

    const tick = screen.getByRole('link', { name: 'Ver histórico de Combustível' });
    expect(tick).toHaveTextContent('Combustível');
    expect(tick).toHaveAttribute('tabindex', '0');
  });

  it('should select the category on click', () => {
    const onSelect = renderTick();

    fireEvent.click(screen.getByRole('link', { name: 'Ver histórico de Combustível' }));

    expect(onSelect).toHaveBeenCalledWith('Combustível');
  });

  it.each(['Enter', ' '])('should select the category with the %p key', (key) => {
    const onSelect = renderTick();

    fireEvent.keyDown(screen.getByRole('link', { name: 'Ver histórico de Combustível' }), { key });

    expect(onSelect).toHaveBeenCalledWith('Combustível');
  });

  it('should ignore other keys', () => {
    const onSelect = renderTick();

    fireEvent.keyDown(screen.getByRole('link', { name: 'Ver histórico de Combustível' }), { key: 'a' });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
