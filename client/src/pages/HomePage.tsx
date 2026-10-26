import HeroSection from '../components/home/HeroSection';
import FeaturedGallery from '../components/home/FeaturedGallery';
import TestimonialsSection from '../components/home/TestimonialsSection';
import CallToActionBanner from '../components/home/CallToActionBanner';

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedGallery />
      <TestimonialsSection />
      <CallToActionBanner />
    </main>
  );
}
