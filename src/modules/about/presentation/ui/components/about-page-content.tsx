import { AboutDifferentiator } from './about-differentiator';
import { AboutFeatures } from './about-features';
import { AboutFooter } from './about-footer';
import { AboutHeader } from './about-header';
import { AboutHero } from './about-hero';
import { AboutScreens } from './about-screens';
import { AboutWhatIs } from './about-what-is';

export function AboutPageContent() {
  return (
    <div className='min-h-screen bg-background'>
      <AboutHeader />
      <AboutHero />
      <AboutWhatIs />
      <AboutFeatures />
      <AboutScreens />
      <AboutDifferentiator />
      <AboutFooter />
    </div>
  );
}
