'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import type { FocusEvent } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

import { cn } from '@/shared/presentation/ui/lib/utils';

export type CarouselSlide = {
  src: string;
  alt: string;
  caption: string;
};

type ScreenshotCarouselProps = {
  slides: CarouselSlide[];
};

const AUTO_ADVANCE_INTERVAL_MS = 5000;
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', onChange);

  return () => media.removeEventListener('change', onChange);
}

function prefersReducedMotion() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function ScreenshotCarousel({ slides }: ScreenshotCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  // null = not chosen yet: plays unless the system asks for reduced motion.
  const [isPlayingChoice, setIsPlayingChoice] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    prefersReducedMotion,
    () => false,
  );

  const isPlaying = isPlayingChoice ?? !reducedMotion;
  // WCAG 2.2.2: it never moves while the user is on it (mouse or keyboard)
  // and can be stopped with the pause button.
  const isAdvancing = isPlaying && !isHovered && !hasFocusWithin;

  useEffect(() => {
    if (!isAdvancing) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isAdvancing, slides.length]);

  function goToPrevious() {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length,
    );
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setHasFocusWithin(false);
    }
  }

  const activeSlide = slides[activeIndex];

  return (
    <div
      className='mx-auto w-full max-w-3xl'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={handleBlur}
    >
      <div className='relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg shadow-border/60'>
        <div className='relative aspect-[16/10] w-full'>
          <Image
            key={activeSlide.src}
            src={activeSlide.src}
            alt={activeSlide.alt}
            fill
            sizes='(min-width: 768px) 768px, 100vw'
            className='object-cover object-top'
          />
        </div>

        <button
          type='button'
          onClick={goToPrevious}
          aria-label='Tela anterior'
          className='absolute left-3 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          <ChevronLeft aria-hidden='true' className='size-5' />
        </button>

        <button
          type='button'
          onClick={goToNext}
          aria-label='Próxima tela'
          className='absolute right-3 top-1/2 inline-flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm ring-1 ring-border transition hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          <ChevronRight aria-hidden='true' className='size-5' />
        </button>
      </div>

      <p className='mt-4 text-center text-sm text-muted-foreground'>
        {activeSlide.caption}
      </p>

      <div className='mt-4 flex items-center justify-center gap-1'>
        <button
          type='button'
          onClick={() => setIsPlayingChoice(!isPlaying)}
          aria-label={isPlaying ? 'Pausar apresentação' : 'Continuar apresentação'}
          className='mr-1 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground ring-1 ring-border transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
        >
          {isPlaying ? (
            <Pause aria-hidden='true' className='size-4' />
          ) : (
            <Play aria-hidden='true' className='size-4' />
          )}
        </button>

        {slides.map((slide, index) => (
          // 24px target (WCAG 2.5.8) around a 10px dot.
          <button
            key={slide.src}
            type='button'
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para ${slide.alt}`}
            aria-current={index === activeIndex}
            className='group inline-flex size-6 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <span
              aria-hidden='true'
              className={cn(
                'size-2.5 rounded-full transition',
                index === activeIndex
                  ? 'bg-hero-accent'
                  : 'bg-border group-hover:bg-muted-foreground/40',
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
