import { cn } from '@/app/lib/utils';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon, ChartBarIcon } from 'lucide-react';

const features = [
  {
    name: 'Ressources pratiques',
    description:
      'Explorez des fiches concrètes et faciles à appliquer pour améliorer votre bien-être au quotidien.',
    icon: BookOpenIcon,
  },
  {
    name: 'Exercices de respiration',
    description:
      'Pratiquez des techniques de respiration guidées pour réduire le stress et renforcer votre équilibre intérieur.',
    icon: ChartBarIcon,
  },
  {
    name: 'Conseils d’experts',
    description:
      'Profitez de recommandations fiables, validées par des professionnels de la santé et du bien-être.',
    icon: LightBulbIcon,
  },
];
export default function FeaturesSection() {
  return (
    <section
      id='features'
      className='py-16 bg-white'
    >
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        {/* Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-extrabold text-gray-900 sm:text-5xl'>
            Découvrez nos fonctionnalités
          </h2>
          <p className='mt-4 text-xl text-gray-500 max-w-3xl mx-auto'>
            Tout ce dont vous avez besoin pour votre bien-être au quotidien.
          </p>
        </div>

        {/* Features grid */}
        <div className='flex flex-wrap justify-center gap-8'>
          {features.map((feature) => (
            <Card
              key={feature.name}
              className={cn(
                'relative bg-gray-50 shadow-lg rounded-xl h-full transition-transform duration-300 hover:scale-105 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)] min-w-[280px] max-w-md'
              )}
            >
              <CardHeader className='flex flex-col items-center text-center'>
                <div className='flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-full shadow-md'>
                  <feature.icon
                    className='w-6 h-6 text-white'
                    aria-hidden='true'
                  />
                </div>
                <CardTitle className='mt-4 text-lg font-semibold text-gray-900'>
                  {feature.name}
                </CardTitle>
              </CardHeader>
              <CardContent className='mt-2 px-6 pb-6'>
                <p className='text-gray-500 text-justify leading-relaxed'>{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
