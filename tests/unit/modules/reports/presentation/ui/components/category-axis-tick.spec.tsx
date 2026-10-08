import { fireEvent, render, screen } from '@testing-library/react';

import { CategoryAxisTick } from '@/modules/reports/presentation/ui/components/category-axis-tick';

function renderTick(onSelect = jest.fn()) {
  const view = render(
    <svg>
      <CategoryAxisTick
        x={140}
        y={20}
        index={3}
        payload={{ value: 'Combustível' }}
        onSelect={onSelect}
      />
    </svg>,
  );

  return { onSelect, ...view };
}

function tick() {
  return screen.getByRole('link', { name: 'Ver histórico de Combustível' });
}

describe('CategoryAxisTick', () => {
  it('should render the category name as a focusable link', () => {
    renderTick();

    expect(tick()).toHaveTextContent('Combustível');
    expect(tick()).toHaveAttribute('tabindex', '0');
  });

  it('should select the category by its position on click', () => {
    const { onSelect } = renderTick();

    fireEvent.click(tick());

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it.each(['Enter', ' '])('should select the category with the %p key', (key) => {
    const { onSelect } = renderTick();

    fireEvent.keyDown(tick(), { key });

    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it('should ignore other keys', () => {
    const { onSelect } = renderTick();

    fireEvent.keyDown(tick(), { key: 'a' });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('should draw a visible focus ring only while focused', () => {
    const { container } = renderTick();
    const ring = () => container.querySelector('[data-slot="tick-focus-ring"]');

    expect(ring()).toBeNull();

    fireEvent.focus(tick());
    expect(ring()).not.toBeNull();

    fireEvent.blur(tick());
    expect(ring()).toBeNull();
  });
});
