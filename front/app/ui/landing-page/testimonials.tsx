'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ArticleCreatorBadge from '../users/bubble';
const testimonials = [
  {
    name: 'Marie D.',
    role: 'Administratrice depuis 9 mois',
    content:
      "Grâce à CesiZen, j'ai appris à mieux gérer mon stress. Les conseils pratiques m'ont aidé à trouver des solutions concrètes pour mon quotidien.",
  },
  {
    name: 'Thomas L.',
    role: 'Utilisateur depuis 6 mois',
    content:
      "La qualité du contenu est exceptionnelle. J'ai appris énormément sur la gestion du stress et la méditation.",
  },
];
export default function TestimonialsSection() {
  return (
    <section className='bg-indigo-50 py-16'>
      <div className='max-w-7xl mx-auto px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
            Ce que disent nos utilisateurs
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className='rounded-lg shadow-md bg-white'
            >
              <CardHeader className='flex items-center space-x-4 mb-4'>
                <div className='flex items-center space-x-2'>
                  <ArticleCreatorBadge creator={testimonial.name} />
                  <CardTitle className='text-lg font-medium text-gray-900'>
                    {testimonial.name}
                  </CardTitle>
                </div>
                <p className='text-indigo-600 m-0'>{testimonial.role}</p>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 italic'>&quot;{testimonial.content}&quot;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
