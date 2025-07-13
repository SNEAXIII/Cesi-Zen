'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className='relative flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white overflow-hidden'>
      <div className='relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-center h-screen'>
        <div className='text-center w-full mx-auto'>
          <h1 className='text-4xl md:text-6xl font-bold text-black mb-6 leading-tight'>
            Trouvez votre équilibre intérieur avec{' '}
            <span className='text-indigo-600'>CesiZen</span>
          </h1>
          <p className='text-xl text-gray-800 mb-8 max-w-4xl mx-auto'>
            Découvrez des ressources, des conseils et exercices pour votre bien-être au quotidien.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Link href='/register' passHref>
              <Button className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 text-lg flex items-center justify-center gap-2'>
                Créer un compte <ArrowRight className='w-5 h-5' />
              </Button>
            </Link>
            <Link href='#features' passHref>
              <Button
                variant='outline'
                className='text-indigo-700 border-indigo-700 px-6 py-3 text-lg hover:bg-indigo-50'
              >
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}