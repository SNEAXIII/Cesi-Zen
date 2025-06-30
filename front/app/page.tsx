import { Button } from '@/components/ui/button';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import HeroSection from './ui/landing-page/hero-section';
import FeaturesSection from './ui/landing-page/features';
import TestimonialsSection from './ui/landing-page/testimonials';
import CallToAction from './ui/landing-page/call-to-action';

export default function Page() {
  return (
    <div className='min-h-screen'>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CallToAction />
    </div>
  );
}
