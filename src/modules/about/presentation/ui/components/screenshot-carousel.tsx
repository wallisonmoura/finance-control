'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export function ScreenshotCarousel({ slides }: ScreenshotCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  function goToPrevious() {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length,
    );
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % slides.length);
  }

  const activeSlide = slides[activeIndex];

  return (
    <div
      className='mx-auto w-full max-w-3xl'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className='relative overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-border/60'>
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

      <div className='mt-4 flex justify-center gap-2'>
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type='button'
            onClick={() => setActiveIndex(index)}
            aria-label={`Ir para ${slide.alt}`}
            aria-current={index === activeIndex}
            className={cn(
              'size-2.5 cursor-pointer rounded-full transition',
              index === activeIndex
                ? 'bg-accent'
                : 'bg-border hover:bg-muted-foreground/40',
            )}
          />
        ))}
      </div>
    </div>
  );
}
