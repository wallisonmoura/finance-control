import { act, fireEvent, render, screen } from '@testing-library/react';

import {
  CarouselSlide,
  ScreenshotCarousel,
} from '@/modules/about/presentation/ui/components/screenshot-carousel';

const slides: CarouselSlide[] = [
  { src: '/images/a.png', alt: 'Painel', caption: 'Legenda do Painel' },
  { src: '/images/b.png', alt: 'Carteira', caption: 'Legenda da Carteira' },
  { src: '/images/c.png', alt: 'Dívidas', caption: 'Legenda das Dívidas' },
];

function mockReducedMotion(reduce: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: reduce && query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }),
  });
}

function advance(ms: number) {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

describe('ScreenshotCarousel', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReducedMotion(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should advance to the next screen on its own', () => {
    render(<ScreenshotCarousel slides={slides} />);

    advance(5000);

    expect(screen.getByText('Legenda da Carteira')).toBeInTheDocument();
  });

  // WCAG 2.2.2: moving content needs a way to stop it.
  it('should stop and resume with the pause button', () => {
    render(<ScreenshotCarousel slides={slides} />);

    fireEvent.click(screen.getByRole('button', { name: 'Pausar apresentação' }));
    advance(10000);
    expect(screen.getByText('Legenda do Painel')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Continuar apresentação' }));
    advance(5000);
    expect(screen.getByText('Legenda da Carteira')).toBeInTheDocument();
  });

  // Keyboard users must not have the screen change while they are on it.
  it('should not advance while the keyboard focus is inside it', () => {
    render(<ScreenshotCarousel slides={slides} />);

    fireEvent.focus(screen.getByRole('button', { name: 'Próxima tela' }));
    advance(10000);

    expect(screen.getByText('Legenda do Painel')).toBeInTheDocument();
  });

  it('should not advance on its own when the system asks for reduced motion', () => {
    mockReducedMotion(true);
    render(<ScreenshotCarousel slides={slides} />);

    advance(10000);

    expect(screen.getByText('Legenda do Painel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar apresentação' })).toBeInTheDocument();
  });

  // The active dot was bg-accent, which turns dark gray on the (always dark)
  // public pages, and the dots were 10px targets without a focus ring.
  it('should mark the active dot with the brand green and give each dot a 24px target', () => {
    render(<ScreenshotCarousel slides={slides} />);

    const active = screen.getByRole('button', { name: 'Ir para Painel' });

    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveClass('size-6', 'focus-visible:ring-2');
    expect(active.querySelector('span')).toHaveClass('bg-hero-accent');
  });
});
