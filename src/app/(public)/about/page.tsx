import type { Metadata } from 'next';

import { AboutPageContent } from '@/modules/about/presentation/ui/components/about-page-content';

export const metadata: Metadata = {
  title: 'Sobre',
};

export default function AboutPage() {
  return <AboutPageContent />;
}
